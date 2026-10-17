define(['exports', 'neo-async', 'fs', './handlebars', 'path', 'source-map'], function (exports, _neoAsync, _fs, _handlebars, _path, _sourceMap) {
  /* eslint-env node */
  /* eslint-disable no-console */
  'use strict';

  // istanbul ignore next

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Async = _interopRequireDefault(_neoAsync);

  var _fs2 = _interopRequireDefault(_fs);

  module.exports.loadTemplates = function (opts, callback) {
    loadStrings(opts, function (err, strings) {
      if (err) {
        callback(err);
      } else {
        loadFiles(opts, function (err, files) {
          if (err) {
            callback(err);
          } else {
            opts.templates = strings.concat(files);
            callback(undefined, opts);
          }
        });
      }
    });
  };

  function loadStrings(opts, callback) {
    var strings = arrayCast(opts.string),
        names = arrayCast(opts.name);

    if (names.length !== strings.length && strings.length > 1) {
      return callback(new _handlebars.Exception('Number of names did not match the number of string inputs'));
    }

    _Async['default'].map(strings, function (string, callback) {
      if (string !== '-') {
        callback(undefined, string);
      } else {
        (function () {
          // Load from stdin
          var buffer = '';
          process.stdin.setEncoding('utf8');

          process.stdin.on('data', function (chunk) {
            buffer += chunk;
          });
          process.stdin.on('end', function () {
            callback(undefined, buffer);
          });
        })();
      }
    }, function (err, strings) {
      strings = strings.map(function (string, index) {
        return {
          name: names[index],
          path: names[index],
          source: string
        };
      });
      callback(err, strings);
    });
  }

  function loadFiles(opts, callback) {
    // Build file extension pattern
    var extension = (opts.extension || 'handlebars').replace(/[\\^$*+?.():=!|{}\-[\]]/g, function (arg) {
      return '\\' + arg;
    });
    extension = new RegExp('\\.' + extension + '$');

    var ret = [],
        queue = (opts.files || []).map(function (template) {
      return { template: template, root: opts.root };
    });
    _Async['default'].whilst(function () {
      return queue.length;
    }, function (callback) {
      var _queue$shift = queue.shift();

      var path = _queue$shift.template;
      var root = _queue$shift.root;

      _fs2['default'].stat(path, function (err, stat) {
        if (err) {
          return callback(new _handlebars.Exception('Unable to open template file "' + path + '"'));
        }

        if (stat.isDirectory()) {
          opts.hasDirectory = true;

          _fs2['default'].readdir(path, function (err, children) {
            /* istanbul ignore next : Race condition that being too lazy to test */
            if (err) {
              return callback(err);
            }
            children.forEach(function (file) {
              var childPath = path + '/' + file;

              if (extension.test(childPath) || _fs2['default'].statSync(childPath).isDirectory()) {
                queue.push({ template: childPath, root: root || path });
              }
            });

            callback();
          });
        } else {
          _fs2['default'].readFile(path, 'utf8', function (err, data) {
            /* istanbul ignore next : Race condition that being too lazy to test */
            if (err) {
              return callback(err);
            }

            if (opts.bom && data.indexOf('﻿') === 0) {
              data = data.substring(1);
            }

            // Clean the template name
            var name = path;
            if (!root) {
              name = _path.basename(name);
            } else if (name.indexOf(root) === 0) {
              name = name.substring(root.length + 1);
            }
            name = name.replace(extension, '');

            ret.push({
              path: path,
              name: name,
              source: data
            });

            callback();
          });
        }
      });
    }, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(undefined, ret);
      }
    });
  }

  module.exports.cli = function (opts) {
    if (opts.version) {
      console.log(_handlebars.VERSION);
      return;
    }

    if (!opts.templates.length && !opts.hasDirectory) {
      throw new _handlebars.Exception('Must define at least one template or directory.');
    }

    if (opts.simple && opts.min) {
      throw new _handlebars.Exception('Unable to minimize simple output');
    }

    var multiple = opts.templates.length !== 1 || opts.hasDirectory;
    if (opts.simple && multiple) {
      throw new _handlebars.Exception('Unable to output multiple templates in simple mode');
    }

    // Force simple mode if we have only one template and it's unnamed.
    if (!opts.amd && !opts.commonjs && opts.templates.length === 1 && !opts.templates[0].name) {
      opts.simple = true;
    }

    // Convert the known list into a hash
    var known = {};
    if (opts.known && !Array.isArray(opts.known)) {
      opts.known = [opts.known];
    }
    if (opts.known) {
      for (var i = 0, len = opts.known.length; i < len; i++) {
        known[opts.known[i]] = true;
      }
    }

    var objectName = opts.partial ? 'Handlebars.partials' : 'templates';

    if (opts.namespace && !isValidNamespace(opts.namespace)) {
      throw new _handlebars.Exception('Invalid namespace format');
    }

    var output = new _sourceMap.SourceNode();
    if (!opts.simple) {
      if (opts.amd) {
        var runtimeModulePath = (opts.handlebarPath || '') + 'handlebars.runtime';
        output.add('define([' + quoteForJavaScript(runtimeModulePath) + '], function(Handlebars) {\n  Handlebars = Handlebars["default"];');
      } else if (opts.commonjs) {
        output.add('var Handlebars = require(' + quoteForJavaScript(opts.commonjs) + ');');
      } else {
        output.add('(function() {\n');
      }
      output.add('  var template = Handlebars.template, templates = ');
      if (opts.namespace) {
        output.add(opts.namespace);
        output.add(' = ');
        output.add(opts.namespace);
        output.add(' || ');
      }
      output.add('{};\n');
    }

    opts.templates.forEach(function (template) {
      var options = {
        knownHelpers: known,
        knownHelpersOnly: opts.o
      };

      if (opts.map) {
        options.srcName = template.path;
      }
      if (opts.data) {
        options.data = true;
      }

      var precompiled = _handlebars.precompile(template.source, options);

      // If we are generating a source map, we have to reconstruct the SourceNode object
      if (opts.map) {
        var consumer = new _sourceMap.SourceMapConsumer(precompiled.map);
        precompiled = _sourceMap.SourceNode.fromStringWithSourceMap(precompiled.code, consumer);
      }

      if (opts.simple) {
        output.add([precompiled, '\n']);
      } else {
        if (!template.name) {
          throw new _handlebars.Exception('Name missing for template');
        }

        if (opts.amd && !multiple) {
          output.add('return ');
        }
        output.add([objectName, '[', quoteForJavaScript(template.name), '] = template(', precompiled, ');\n']);
      }
    });

    // Output the content
    if (!opts.simple) {
      if (opts.amd) {
        if (multiple) {
          output.add(['return ', objectName, ';\n']);
        }
        output.add('});');
      } else if (!opts.commonjs) {
        output.add('})();');
      }
    }

    if (opts.map) {
      output.add('\n//# sourceMappingURL=' + sanitizeSourceMapComment(opts.map) + '\n');
    }

    output = output.toStringWithSourceMap();
    output.map = output.map + '';

    if (opts.min) {
      output = minify(output, opts.map);
    }

    if (opts.map) {
      _fs2['default'].writeFileSync(opts.map, output.map, 'utf8');
    }
    output = output.code;

    if (opts.output) {
      _fs2['default'].writeFileSync(opts.output, output, 'utf8');
    } else {
      console.log(output);
    }
  };

  function arrayCast(value) {
    value = value != null ? value : [];
    if (!Array.isArray(value)) {
      value = [value];
    }
    return value;
  }

  /*
   * Safely quotes a value for embedding in generated JavaScript strings
   *
   * Uses JSON.stringify which handles all special characters.
   */
  function quoteForJavaScript(value) {
    return JSON.stringify(String(value));
  }

  /**
   * Validates that a namespace is a legitimate dotted JavaScript identifier
   * (e.g. "App.templates") to prevent arbitrary code injection
   */
  function isValidNamespace(namespace) {
    return (/^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(namespace)
    );
  }

  /**
   * Strips line terminators from source map URLs to prevent injection of new
   * JavaScript lines via the sourceMappingURL comment
   */
  function sanitizeSourceMapComment(value) {
    return String(value).replace(/[\r\n\u2028\u2029]/g, '');
  }

  /**
   * Run uglify to minify the compiled template, if uglify exists in the dependencies.
   *
   * We are using `require` instead of `import` here, because es6-modules do not allow
   * dynamic imports and uglify-js is an optional dependency. Since we are inside NodeJS here, this
   * should not be a problem.
   *
   * @param {string} output the compiled template
   * @param {string} sourceMapFile the file to write the source map to.
   */
  function minify(output, sourceMapFile) {
    try {
      // Try to resolve uglify-js in order to see if it does exist
      require.resolve('uglify-js');
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        // Something else seems to be wrong
        throw e;
      }
      // it does not exist!
      console.error('Code minimization is disabled due to missing uglify-js dependency');
      return output;
    }
    return require('uglify-js').minify(output.code, {
      sourceMap: {
        content: output.map,
        url: sourceMapFile
      }
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9wcmVjb21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBUUEsUUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBUyxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3RELGVBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBUyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLFVBQUksR0FBRyxFQUFFO0FBQ1AsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNmLE1BQU07QUFDTCxpQkFBUyxDQUFDLElBQUksRUFBRSxVQUFTLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDbkMsY0FBSSxHQUFHLEVBQUU7QUFDUCxvQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1dBQ2YsTUFBTTtBQUNMLGdCQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkMsb0JBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7V0FDM0I7U0FDRixDQUFDLENBQUM7T0FDSjtLQUNGLENBQUMsQ0FBQztHQUNKLENBQUM7O0FBRUYsV0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUNuQyxRQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFL0IsUUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekQsYUFBTyxRQUFRLENBQ2IsSUFBSSxZQUFXLFNBQVMsQ0FDdEIsMkRBQTJELENBQzVELENBQ0YsQ0FBQztLQUNIOztBQUVELHNCQUFNLEdBQUcsQ0FDUCxPQUFPLEVBQ1AsVUFBUyxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3pCLFVBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtBQUNsQixnQkFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUM3QixNQUFNOzs7QUFFTCxjQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsaUJBQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVsQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3ZDLGtCQUFNLElBQUksS0FBSyxDQUFDO1dBQ2pCLENBQUMsQ0FBQztBQUNILGlCQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBVztBQUNqQyxvQkFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztXQUM3QixDQUFDLENBQUM7O09BQ0o7S0FDRixFQUNELFVBQVMsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUNyQixhQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sRUFBRSxLQUFLO2VBQU07QUFDeEMsY0FBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDbEIsY0FBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDbEIsZ0JBQU0sRUFBRSxNQUFNO1NBQ2Y7T0FBQyxDQUFDLENBQUM7QUFDSixjQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3hCLENBQ0YsQ0FBQztHQUNIOztBQUVELFdBQVMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7O0FBRWpDLFFBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxZQUFZLENBQUEsQ0FBRSxPQUFPLENBQ3RELDBCQUEwQixFQUMxQixVQUFTLEdBQUcsRUFBRTtBQUNaLGFBQU8sSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUNuQixDQUNGLENBQUM7QUFDRixhQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFaEQsUUFBSSxHQUFHLEdBQUcsRUFBRTtRQUNWLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFBLENBQUUsR0FBRyxDQUFDLFVBQUEsUUFBUTthQUFLLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtLQUFDLENBQUMsQ0FBQztBQUM5RSxzQkFBTSxNQUFNLENBQ1Y7YUFBTSxLQUFLLENBQUMsTUFBTTtLQUFBLEVBQ2xCLFVBQVMsUUFBUSxFQUFFO3lCQUNjLEtBQUssQ0FBQyxLQUFLLEVBQUU7O1VBQTVCLElBQUksZ0JBQWQsUUFBUTtVQUFRLElBQUksZ0JBQUosSUFBSTs7QUFFMUIsc0JBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDaEMsWUFBSSxHQUFHLEVBQUU7QUFDUCxpQkFBTyxRQUFRLENBQ2IsSUFBSSxZQUFXLFNBQVMsb0NBQWtDLElBQUksT0FBSSxDQUNuRSxDQUFDO1NBQ0g7O0FBRUQsWUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDdEIsY0FBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7O0FBRXpCLDBCQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBUyxHQUFHLEVBQUUsUUFBUSxFQUFFOztBQUV2QyxnQkFBSSxHQUFHLEVBQUU7QUFDUCxxQkFBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7QUFDRCxvQkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUksRUFBRTtBQUM5QixrQkFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7O0FBRWxDLGtCQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQ3pCLGdCQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFDcEM7QUFDQSxxQkFBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2VBQ3pEO2FBQ0YsQ0FBQyxDQUFDOztBQUVILG9CQUFRLEVBQUUsQ0FBQztXQUNaLENBQUMsQ0FBQztTQUNKLE1BQU07QUFDTCwwQkFBRyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUU7O0FBRTVDLGdCQUFJLEdBQUcsRUFBRTtBQUNQLHFCQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0Qjs7QUFFRCxnQkFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzVDLGtCQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjs7O0FBR0QsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixnQkFBSSxDQUFDLElBQUksRUFBRTtBQUNULGtCQUFJLEdBQUcsTUF4SFosUUFBUSxDQXdIYSxJQUFJLENBQUMsQ0FBQzthQUN2QixNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbkMsa0JBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDeEM7QUFDRCxnQkFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVuQyxlQUFHLENBQUMsSUFBSSxDQUFDO0FBQ1Asa0JBQUksRUFBRSxJQUFJO0FBQ1Ysa0JBQUksRUFBRSxJQUFJO0FBQ1Ysb0JBQU0sRUFBRSxJQUFJO2FBQ2IsQ0FBQyxDQUFDOztBQUVILG9CQUFRLEVBQUUsQ0FBQztXQUNaLENBQUMsQ0FBQztTQUNKO09BQ0YsQ0FBQyxDQUFDO0tBQ0osRUFDRCxVQUFTLEdBQUcsRUFBRTtBQUNaLFVBQUksR0FBRyxFQUFFO0FBQ1AsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNmLE1BQU07QUFDTCxnQkFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUMxQjtLQUNGLENBQ0YsQ0FBQztHQUNIOztBQUVELFFBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2xDLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixhQUFPLENBQUMsR0FBRyxDQUFDLFlBQVcsT0FBTyxDQUFDLENBQUM7QUFDaEMsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDaEQsWUFBTSxJQUFJLFlBQVcsU0FBUyxDQUM1QixpREFBaUQsQ0FDbEQsQ0FBQztLQUNIOztBQUVELFFBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQzNCLFlBQU0sSUFBSSxZQUFXLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0tBQ3BFOztBQUVELFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2xFLFFBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQUU7QUFDM0IsWUFBTSxJQUFJLFlBQVcsU0FBUyxDQUM1QixvREFBb0QsQ0FDckQsQ0FBQztLQUNIOzs7QUFHRCxRQUNFLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFDVCxDQUFDLElBQUksQ0FBQyxRQUFRLElBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUMzQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUN2QjtBQUNBLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOzs7QUFHRCxRQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUM1QyxVQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNCO0FBQ0QsUUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckQsYUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDN0I7S0FDRjs7QUFFRCxRQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixHQUFHLFdBQVcsQ0FBQzs7QUFFdEUsUUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3ZELFlBQU0sSUFBSSxZQUFXLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0tBQzVEOztBQUVELFFBQUksTUFBTSxHQUFHLGVBcE1hLFVBQVUsRUFvTVAsQ0FBQztBQUM5QixRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDWixZQUFNLGlCQUFpQixHQUNyQixDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFBLEdBQUksb0JBQW9CLENBQUM7QUFDcEQsY0FBTSxDQUFDLEdBQUcsQ0FDUixVQUFVLEdBQ1Isa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsR0FDckMsa0VBQWtFLENBQ3JFLENBQUM7T0FDSCxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUN4QixjQUFNLENBQUMsR0FBRyxDQUNSLDJCQUEyQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQ3ZFLENBQUM7T0FDSCxNQUFNO0FBQ0wsY0FBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQy9CO0FBQ0QsWUFBTSxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0FBQ2pFLFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixjQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixjQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLGNBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLGNBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEI7QUFDRCxZQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JCOztBQUVELFFBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQ3hDLFVBQUksT0FBTyxHQUFHO0FBQ1osb0JBQVksRUFBRSxLQUFLO0FBQ25CLHdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3pCLENBQUM7O0FBRUYsVUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osZUFBTyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO09BQ2pDO0FBQ0QsVUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2IsZUFBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7T0FDckI7O0FBRUQsVUFBSSxXQUFXLEdBQUcsWUFBVyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBR2xFLFVBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNaLFlBQUksUUFBUSxHQUFHLGVBaFBaLGlCQUFpQixDQWdQaUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RELG1CQUFXLEdBQUcsV0FqUFEsVUFBVSxDQWlQUCx1QkFBdUIsQ0FDOUMsV0FBVyxDQUFDLElBQUksRUFDaEIsUUFBUSxDQUNULENBQUM7T0FDSDs7QUFFRCxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixjQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDakMsTUFBTTtBQUNMLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ2xCLGdCQUFNLElBQUksWUFBVyxTQUFTLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3RDs7QUFFRCxZQUFJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDekIsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkI7QUFDRCxjQUFNLENBQUMsR0FBRyxDQUFDLENBQ1QsVUFBVSxFQUNWLEdBQUcsRUFDSCxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQ2pDLGVBQWUsRUFDZixXQUFXLEVBQ1gsTUFBTSxDQUNQLENBQUMsQ0FBQztPQUNKO0tBQ0YsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDWixZQUFJLFFBQVEsRUFBRTtBQUNaLGdCQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsY0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNuQixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3pCLGNBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDckI7S0FDRjs7QUFFRCxRQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDWixZQUFNLENBQUMsR0FBRyxDQUNSLHlCQUF5QixHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQ3RFLENBQUM7S0FDSDs7QUFFRCxVQUFNLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDeEMsVUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFN0IsUUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osWUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ25DOztBQUVELFFBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNaLHNCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDaEQ7QUFDRCxVQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFckIsUUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2Ysc0JBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQy9DLE1BQU07QUFDTCxhQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDeEIsU0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN6QixXQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQjtBQUNELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7Ozs7Ozs7QUFPRCxXQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBRTtBQUNqQyxXQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDdEM7Ozs7OztBQU1ELFdBQVMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO0FBQ25DLFdBQU8sMERBQXlELENBQUMsSUFBSSxDQUNuRSxTQUFTLENBQ1Y7TUFBQztHQUNIOzs7Ozs7QUFNRCxXQUFTLHdCQUF3QixDQUFDLEtBQUssRUFBRTtBQUN2QyxXQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDekQ7Ozs7Ozs7Ozs7OztBQVlELFdBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUU7QUFDckMsUUFBSTs7QUFFRixhQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzlCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixVQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLEVBQUU7O0FBRWpDLGNBQU0sQ0FBQyxDQUFDO09BQ1Q7O0FBRUQsYUFBTyxDQUFDLEtBQUssQ0FDWCxtRUFBbUUsQ0FDcEUsQ0FBQztBQUNGLGFBQU8sTUFBTSxDQUFDO0tBQ2Y7QUFDRCxXQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUM5QyxlQUFTLEVBQUU7QUFDVCxlQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUc7QUFDbkIsV0FBRyxFQUFFLGFBQWE7T0FDbkI7S0FDRixDQUFDLENBQUM7R0FDSiIsImZpbGUiOiJwcmVjb21waWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgbm9kZSAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuaW1wb3J0IEFzeW5jIGZyb20gJ25lby1hc3luYyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICcuL2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgYmFzZW5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNvdXJjZU1hcENvbnN1bWVyLCBTb3VyY2VOb2RlIH0gZnJvbSAnc291cmNlLW1hcCc7XG5cbm1vZHVsZS5leHBvcnRzLmxvYWRUZW1wbGF0ZXMgPSBmdW5jdGlvbihvcHRzLCBjYWxsYmFjaykge1xuICBsb2FkU3RyaW5ncyhvcHRzLCBmdW5jdGlvbihlcnIsIHN0cmluZ3MpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkRmlsZXMob3B0cywgZnVuY3Rpb24oZXJyLCBmaWxlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRzLnRlbXBsYXRlcyA9IHN0cmluZ3MuY29uY2F0KGZpbGVzKTtcbiAgICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gbG9hZFN0cmluZ3Mob3B0cywgY2FsbGJhY2spIHtcbiAgbGV0IHN0cmluZ3MgPSBhcnJheUNhc3Qob3B0cy5zdHJpbmcpLFxuICAgIG5hbWVzID0gYXJyYXlDYXN0KG9wdHMubmFtZSk7XG5cbiAgaWYgKG5hbWVzLmxlbmd0aCAhPT0gc3RyaW5ncy5sZW5ndGggJiYgc3RyaW5ncy5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKFxuICAgICAgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFxuICAgICAgICAnTnVtYmVyIG9mIG5hbWVzIGRpZCBub3QgbWF0Y2ggdGhlIG51bWJlciBvZiBzdHJpbmcgaW5wdXRzJ1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBBc3luYy5tYXAoXG4gICAgc3RyaW5ncyxcbiAgICBmdW5jdGlvbihzdHJpbmcsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoc3RyaW5nICE9PSAnLScpIHtcbiAgICAgICAgY2FsbGJhY2sodW5kZWZpbmVkLCBzdHJpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTG9hZCBmcm9tIHN0ZGluXG4gICAgICAgIGxldCBidWZmZXIgPSAnJztcbiAgICAgICAgcHJvY2Vzcy5zdGRpbi5zZXRFbmNvZGluZygndXRmOCcpO1xuXG4gICAgICAgIHByb2Nlc3Muc3RkaW4ub24oJ2RhdGEnLCBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgIGJ1ZmZlciArPSBjaHVuaztcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Nlc3Muc3RkaW4ub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHVuZGVmaW5lZCwgYnVmZmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmdW5jdGlvbihlcnIsIHN0cmluZ3MpIHtcbiAgICAgIHN0cmluZ3MgPSBzdHJpbmdzLm1hcCgoc3RyaW5nLCBpbmRleCkgPT4gKHtcbiAgICAgICAgbmFtZTogbmFtZXNbaW5kZXhdLFxuICAgICAgICBwYXRoOiBuYW1lc1tpbmRleF0sXG4gICAgICAgIHNvdXJjZTogc3RyaW5nXG4gICAgICB9KSk7XG4gICAgICBjYWxsYmFjayhlcnIsIHN0cmluZ3MpO1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gbG9hZEZpbGVzKG9wdHMsIGNhbGxiYWNrKSB7XG4gIC8vIEJ1aWxkIGZpbGUgZXh0ZW5zaW9uIHBhdHRlcm5cbiAgbGV0IGV4dGVuc2lvbiA9IChvcHRzLmV4dGVuc2lvbiB8fCAnaGFuZGxlYmFycycpLnJlcGxhY2UoXG4gICAgL1tcXFxcXiQqKz8uKCk6PSF8e31cXC1bXFxdXS9nLFxuICAgIGZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuICdcXFxcJyArIGFyZztcbiAgICB9XG4gICk7XG4gIGV4dGVuc2lvbiA9IG5ldyBSZWdFeHAoJ1xcXFwuJyArIGV4dGVuc2lvbiArICckJyk7XG5cbiAgbGV0IHJldCA9IFtdLFxuICAgIHF1ZXVlID0gKG9wdHMuZmlsZXMgfHwgW10pLm1hcCh0ZW1wbGF0ZSA9PiAoeyB0ZW1wbGF0ZSwgcm9vdDogb3B0cy5yb290IH0pKTtcbiAgQXN5bmMud2hpbHN0KFxuICAgICgpID0+IHF1ZXVlLmxlbmd0aCxcbiAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgbGV0IHsgdGVtcGxhdGU6IHBhdGgsIHJvb3QgfSA9IHF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24oZXJyLCBzdGF0KSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oYFVuYWJsZSB0byBvcGVuIHRlbXBsYXRlIGZpbGUgXCIke3BhdGh9XCJgKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgb3B0cy5oYXNEaXJlY3RvcnkgPSB0cnVlO1xuXG4gICAgICAgICAgZnMucmVhZGRpcihwYXRoLCBmdW5jdGlvbihlcnIsIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCA6IFJhY2UgY29uZGl0aW9uIHRoYXQgYmVpbmcgdG9vIGxhenkgdG8gdGVzdCAqL1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICBsZXQgY2hpbGRQYXRoID0gcGF0aCArICcvJyArIGZpbGU7XG5cbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbi50ZXN0KGNoaWxkUGF0aCkgfHxcbiAgICAgICAgICAgICAgICBmcy5zdGF0U3luYyhjaGlsZFBhdGgpLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaCh7IHRlbXBsYXRlOiBjaGlsZFBhdGgsIHJvb3Q6IHJvb3QgfHwgcGF0aCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnMucmVhZEZpbGUocGF0aCwgJ3V0ZjgnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IDogUmFjZSBjb25kaXRpb24gdGhhdCBiZWluZyB0b28gbGF6eSB0byB0ZXN0ICovXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5ib20gJiYgZGF0YS5pbmRleE9mKCdcXHVGRUZGJykgPT09IDApIHtcbiAgICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDbGVhbiB0aGUgdGVtcGxhdGUgbmFtZVxuICAgICAgICAgICAgbGV0IG5hbWUgPSBwYXRoO1xuICAgICAgICAgICAgaWYgKCFyb290KSB7XG4gICAgICAgICAgICAgIG5hbWUgPSBiYXNlbmFtZShuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5pbmRleE9mKHJvb3QpID09PSAwKSB7XG4gICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZyhyb290Lmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZShleHRlbnNpb24sICcnKTtcblxuICAgICAgICAgICAgcmV0LnB1c2goe1xuICAgICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICBzb3VyY2U6IGRhdGFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2sodW5kZWZpbmVkLCByZXQpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuY2xpID0gZnVuY3Rpb24ob3B0cykge1xuICBpZiAob3B0cy52ZXJzaW9uKSB7XG4gICAgY29uc29sZS5sb2coSGFuZGxlYmFycy5WRVJTSU9OKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIW9wdHMudGVtcGxhdGVzLmxlbmd0aCAmJiAhb3B0cy5oYXNEaXJlY3RvcnkpIHtcbiAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXG4gICAgICAnTXVzdCBkZWZpbmUgYXQgbGVhc3Qgb25lIHRlbXBsYXRlIG9yIGRpcmVjdG9yeS4nXG4gICAgKTtcbiAgfVxuXG4gIGlmIChvcHRzLnNpbXBsZSAmJiBvcHRzLm1pbikge1xuICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignVW5hYmxlIHRvIG1pbmltaXplIHNpbXBsZSBvdXRwdXQnKTtcbiAgfVxuXG4gIGNvbnN0IG11bHRpcGxlID0gb3B0cy50ZW1wbGF0ZXMubGVuZ3RoICE9PSAxIHx8IG9wdHMuaGFzRGlyZWN0b3J5O1xuICBpZiAob3B0cy5zaW1wbGUgJiYgbXVsdGlwbGUpIHtcbiAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXG4gICAgICAnVW5hYmxlIHRvIG91dHB1dCBtdWx0aXBsZSB0ZW1wbGF0ZXMgaW4gc2ltcGxlIG1vZGUnXG4gICAgKTtcbiAgfVxuXG4gIC8vIEZvcmNlIHNpbXBsZSBtb2RlIGlmIHdlIGhhdmUgb25seSBvbmUgdGVtcGxhdGUgYW5kIGl0J3MgdW5uYW1lZC5cbiAgaWYgKFxuICAgICFvcHRzLmFtZCAmJlxuICAgICFvcHRzLmNvbW1vbmpzICYmXG4gICAgb3B0cy50ZW1wbGF0ZXMubGVuZ3RoID09PSAxICYmXG4gICAgIW9wdHMudGVtcGxhdGVzWzBdLm5hbWVcbiAgKSB7XG4gICAgb3B0cy5zaW1wbGUgPSB0cnVlO1xuICB9XG5cbiAgLy8gQ29udmVydCB0aGUga25vd24gbGlzdCBpbnRvIGEgaGFzaFxuICBsZXQga25vd24gPSB7fTtcbiAgaWYgKG9wdHMua25vd24gJiYgIUFycmF5LmlzQXJyYXkob3B0cy5rbm93bikpIHtcbiAgICBvcHRzLmtub3duID0gW29wdHMua25vd25dO1xuICB9XG4gIGlmIChvcHRzLmtub3duKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG9wdHMua25vd24ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGtub3duW29wdHMua25vd25baV1dID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBvYmplY3ROYW1lID0gb3B0cy5wYXJ0aWFsID8gJ0hhbmRsZWJhcnMucGFydGlhbHMnIDogJ3RlbXBsYXRlcyc7XG5cbiAgaWYgKG9wdHMubmFtZXNwYWNlICYmICFpc1ZhbGlkTmFtZXNwYWNlKG9wdHMubmFtZXNwYWNlKSkge1xuICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignSW52YWxpZCBuYW1lc3BhY2UgZm9ybWF0Jyk7XG4gIH1cblxuICBsZXQgb3V0cHV0ID0gbmV3IFNvdXJjZU5vZGUoKTtcbiAgaWYgKCFvcHRzLnNpbXBsZSkge1xuICAgIGlmIChvcHRzLmFtZCkge1xuICAgICAgY29uc3QgcnVudGltZU1vZHVsZVBhdGggPVxuICAgICAgICAob3B0cy5oYW5kbGViYXJQYXRoIHx8ICcnKSArICdoYW5kbGViYXJzLnJ1bnRpbWUnO1xuICAgICAgb3V0cHV0LmFkZChcbiAgICAgICAgJ2RlZmluZShbJyArXG4gICAgICAgICAgcXVvdGVGb3JKYXZhU2NyaXB0KHJ1bnRpbWVNb2R1bGVQYXRoKSArXG4gICAgICAgICAgJ10sIGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcXG4gIEhhbmRsZWJhcnMgPSBIYW5kbGViYXJzW1wiZGVmYXVsdFwiXTsnXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAob3B0cy5jb21tb25qcykge1xuICAgICAgb3V0cHV0LmFkZChcbiAgICAgICAgJ3ZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnICsgcXVvdGVGb3JKYXZhU2NyaXB0KG9wdHMuY29tbW9uanMpICsgJyk7J1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LmFkZCgnKGZ1bmN0aW9uKCkge1xcbicpO1xuICAgIH1cbiAgICBvdXRwdXQuYWRkKCcgIHZhciB0ZW1wbGF0ZSA9IEhhbmRsZWJhcnMudGVtcGxhdGUsIHRlbXBsYXRlcyA9ICcpO1xuICAgIGlmIChvcHRzLm5hbWVzcGFjZSkge1xuICAgICAgb3V0cHV0LmFkZChvcHRzLm5hbWVzcGFjZSk7XG4gICAgICBvdXRwdXQuYWRkKCcgPSAnKTtcbiAgICAgIG91dHB1dC5hZGQob3B0cy5uYW1lc3BhY2UpO1xuICAgICAgb3V0cHV0LmFkZCgnIHx8ICcpO1xuICAgIH1cbiAgICBvdXRwdXQuYWRkKCd7fTtcXG4nKTtcbiAgfVxuXG4gIG9wdHMudGVtcGxhdGVzLmZvckVhY2goZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgIGtub3duSGVscGVyczoga25vd24sXG4gICAgICBrbm93bkhlbHBlcnNPbmx5OiBvcHRzLm9cbiAgICB9O1xuXG4gICAgaWYgKG9wdHMubWFwKSB7XG4gICAgICBvcHRpb25zLnNyY05hbWUgPSB0ZW1wbGF0ZS5wYXRoO1xuICAgIH1cbiAgICBpZiAob3B0cy5kYXRhKSB7XG4gICAgICBvcHRpb25zLmRhdGEgPSB0cnVlO1xuICAgIH1cblxuICAgIGxldCBwcmVjb21waWxlZCA9IEhhbmRsZWJhcnMucHJlY29tcGlsZSh0ZW1wbGF0ZS5zb3VyY2UsIG9wdGlvbnMpO1xuXG4gICAgLy8gSWYgd2UgYXJlIGdlbmVyYXRpbmcgYSBzb3VyY2UgbWFwLCB3ZSBoYXZlIHRvIHJlY29uc3RydWN0IHRoZSBTb3VyY2VOb2RlIG9iamVjdFxuICAgIGlmIChvcHRzLm1hcCkge1xuICAgICAgbGV0IGNvbnN1bWVyID0gbmV3IFNvdXJjZU1hcENvbnN1bWVyKHByZWNvbXBpbGVkLm1hcCk7XG4gICAgICBwcmVjb21waWxlZCA9IFNvdXJjZU5vZGUuZnJvbVN0cmluZ1dpdGhTb3VyY2VNYXAoXG4gICAgICAgIHByZWNvbXBpbGVkLmNvZGUsXG4gICAgICAgIGNvbnN1bWVyXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnNpbXBsZSkge1xuICAgICAgb3V0cHV0LmFkZChbcHJlY29tcGlsZWQsICdcXG4nXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGVtcGxhdGUubmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ05hbWUgbWlzc2luZyBmb3IgdGVtcGxhdGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuYW1kICYmICFtdWx0aXBsZSkge1xuICAgICAgICBvdXRwdXQuYWRkKCdyZXR1cm4gJyk7XG4gICAgICB9XG4gICAgICBvdXRwdXQuYWRkKFtcbiAgICAgICAgb2JqZWN0TmFtZSxcbiAgICAgICAgJ1snLFxuICAgICAgICBxdW90ZUZvckphdmFTY3JpcHQodGVtcGxhdGUubmFtZSksXG4gICAgICAgICddID0gdGVtcGxhdGUoJyxcbiAgICAgICAgcHJlY29tcGlsZWQsXG4gICAgICAgICcpO1xcbidcbiAgICAgIF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gT3V0cHV0IHRoZSBjb250ZW50XG4gIGlmICghb3B0cy5zaW1wbGUpIHtcbiAgICBpZiAob3B0cy5hbWQpIHtcbiAgICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgICBvdXRwdXQuYWRkKFsncmV0dXJuICcsIG9iamVjdE5hbWUsICc7XFxuJ10pO1xuICAgICAgfVxuICAgICAgb3V0cHV0LmFkZCgnfSk7Jyk7XG4gICAgfSBlbHNlIGlmICghb3B0cy5jb21tb25qcykge1xuICAgICAgb3V0cHV0LmFkZCgnfSkoKTsnKTtcbiAgICB9XG4gIH1cblxuICBpZiAob3B0cy5tYXApIHtcbiAgICBvdXRwdXQuYWRkKFxuICAgICAgJ1xcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPScgKyBzYW5pdGl6ZVNvdXJjZU1hcENvbW1lbnQob3B0cy5tYXApICsgJ1xcbidcbiAgICApO1xuICB9XG5cbiAgb3V0cHV0ID0gb3V0cHV0LnRvU3RyaW5nV2l0aFNvdXJjZU1hcCgpO1xuICBvdXRwdXQubWFwID0gb3V0cHV0Lm1hcCArICcnO1xuXG4gIGlmIChvcHRzLm1pbikge1xuICAgIG91dHB1dCA9IG1pbmlmeShvdXRwdXQsIG9wdHMubWFwKTtcbiAgfVxuXG4gIGlmIChvcHRzLm1hcCkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMob3B0cy5tYXAsIG91dHB1dC5tYXAsICd1dGY4Jyk7XG4gIH1cbiAgb3V0cHV0ID0gb3V0cHV0LmNvZGU7XG5cbiAgaWYgKG9wdHMub3V0cHV0KSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhvcHRzLm91dHB1dCwgb3V0cHV0LCAndXRmOCcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKG91dHB1dCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGFycmF5Q2FzdCh2YWx1ZSkge1xuICB2YWx1ZSA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IFtdO1xuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgdmFsdWUgPSBbdmFsdWVdO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLypcbiAqIFNhZmVseSBxdW90ZXMgYSB2YWx1ZSBmb3IgZW1iZWRkaW5nIGluIGdlbmVyYXRlZCBKYXZhU2NyaXB0IHN0cmluZ3NcbiAqXG4gKiBVc2VzIEpTT04uc3RyaW5naWZ5IHdoaWNoIGhhbmRsZXMgYWxsIHNwZWNpYWwgY2hhcmFjdGVycy5cbiAqL1xuZnVuY3Rpb24gcXVvdGVGb3JKYXZhU2NyaXB0KHZhbHVlKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShTdHJpbmcodmFsdWUpKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCBhIG5hbWVzcGFjZSBpcyBhIGxlZ2l0aW1hdGUgZG90dGVkIEphdmFTY3JpcHQgaWRlbnRpZmllclxuICogKGUuZy4gXCJBcHAudGVtcGxhdGVzXCIpIHRvIHByZXZlbnQgYXJiaXRyYXJ5IGNvZGUgaW5qZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWROYW1lc3BhY2UobmFtZXNwYWNlKSB7XG4gIHJldHVybiAvXltBLVphLXpfJF1bQS1aYS16MC05XyRdKihcXC5bQS1aYS16XyRdW0EtWmEtejAtOV8kXSopKiQvLnRlc3QoXG4gICAgbmFtZXNwYWNlXG4gICk7XG59XG5cbi8qKlxuICogU3RyaXBzIGxpbmUgdGVybWluYXRvcnMgZnJvbSBzb3VyY2UgbWFwIFVSTHMgdG8gcHJldmVudCBpbmplY3Rpb24gb2YgbmV3XG4gKiBKYXZhU2NyaXB0IGxpbmVzIHZpYSB0aGUgc291cmNlTWFwcGluZ1VSTCBjb21tZW50XG4gKi9cbmZ1bmN0aW9uIHNhbml0aXplU291cmNlTWFwQ29tbWVudCh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXFxyXFxuXFx1MjAyOFxcdTIwMjldL2csICcnKTtcbn1cblxuLyoqXG4gKiBSdW4gdWdsaWZ5IHRvIG1pbmlmeSB0aGUgY29tcGlsZWQgdGVtcGxhdGUsIGlmIHVnbGlmeSBleGlzdHMgaW4gdGhlIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBXZSBhcmUgdXNpbmcgYHJlcXVpcmVgIGluc3RlYWQgb2YgYGltcG9ydGAgaGVyZSwgYmVjYXVzZSBlczYtbW9kdWxlcyBkbyBub3QgYWxsb3dcbiAqIGR5bmFtaWMgaW1wb3J0cyBhbmQgdWdsaWZ5LWpzIGlzIGFuIG9wdGlvbmFsIGRlcGVuZGVuY3kuIFNpbmNlIHdlIGFyZSBpbnNpZGUgTm9kZUpTIGhlcmUsIHRoaXNcbiAqIHNob3VsZCBub3QgYmUgYSBwcm9ibGVtLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgdGhlIGNvbXBpbGVkIHRlbXBsYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc291cmNlTWFwRmlsZSB0aGUgZmlsZSB0byB3cml0ZSB0aGUgc291cmNlIG1hcCB0by5cbiAqL1xuZnVuY3Rpb24gbWluaWZ5KG91dHB1dCwgc291cmNlTWFwRmlsZSkge1xuICB0cnkge1xuICAgIC8vIFRyeSB0byByZXNvbHZlIHVnbGlmeS1qcyBpbiBvcmRlciB0byBzZWUgaWYgaXQgZG9lcyBleGlzdFxuICAgIHJlcXVpcmUucmVzb2x2ZSgndWdsaWZ5LWpzJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlICE9PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgIC8vIFNvbWV0aGluZyBlbHNlIHNlZW1zIHRvIGJlIHdyb25nXG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICAvLyBpdCBkb2VzIG5vdCBleGlzdCFcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgJ0NvZGUgbWluaW1pemF0aW9uIGlzIGRpc2FibGVkIGR1ZSB0byBtaXNzaW5nIHVnbGlmeS1qcyBkZXBlbmRlbmN5J1xuICAgICk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICByZXR1cm4gcmVxdWlyZSgndWdsaWZ5LWpzJykubWluaWZ5KG91dHB1dC5jb2RlLCB7XG4gICAgc291cmNlTWFwOiB7XG4gICAgICBjb250ZW50OiBvdXRwdXQubWFwLFxuICAgICAgdXJsOiBzb3VyY2VNYXBGaWxlXG4gICAgfVxuICB9KTtcbn1cbiJdfQ==
