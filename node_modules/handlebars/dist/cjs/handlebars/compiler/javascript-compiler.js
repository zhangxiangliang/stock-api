'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('../base');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _codeGen = require('./code-gen');

var _codeGen2 = _interopRequireDefault(_codeGen);

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function nameLookup(parent, name /*,  type */) {
    return this.internalNameLookup(parent, name);
  },
  depthedLookup: function depthedLookup(name) {
    return [this.aliasable('container.lookup'), '(depths, ', JSON.stringify(name), ')'];
  },

  compilerInfo: function compilerInfo() {
    var revision = _base.COMPILER_REVISION,
        versions = _base.REVISION_CHANGES[revision];
    return [revision, versions];
  },

  appendToBuffer: function appendToBuffer(source, location, explicit) {
    // Force a source as this simplifies the merge logic.
    if (!_utils.isArray(source)) {
      source = [source];
    }
    source = this.source.wrap(source, location);

    if (this.environment.isSimple) {
      return ['return ', source, ';'];
    } else if (explicit) {
      // This is a case where the buffer operation occurs as a child of another
      // construct, generally braces. We have to explicitly output these buffer
      // operations to ensure that the emitted code goes in the correct location.
      return ['buffer += ', source, ';'];
    } else {
      source.appendToBuffer = true;
      return source;
    }
  },

  initializeBuffer: function initializeBuffer() {
    return this.quotedString('');
  },
  // END PUBLIC API
  internalNameLookup: function internalNameLookup(parent, name) {
    this.lookupPropertyFunctionIsUsed = true;
    return ['lookupProperty(', parent, ',', JSON.stringify(name), ')'];
  },

  lookupPropertyFunctionIsUsed: false,

  compile: function compile(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options;
    this.stringParams = this.options.stringParams;
    this.trackIds = this.options.trackIds;
    this.precompile = !asObject;

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
      decorators: [],
      programs: [],
      environments: []
    };

    this.preamble();

    this.stackSlot = 0;
    this.stackVars = [];
    this.aliases = {};
    this.registers = { list: [] };
    this.hashes = [];
    this.compileStack = [];
    this.inlineStack = [];
    this.blockParams = [];

    this.compileChildren(environment, options);

    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

    var opcodes = environment.opcodes,
        opcode = undefined,
        firstLoc = undefined,
        i = undefined,
        l = undefined;

    for (i = 0, l = opcodes.length; i < l; i++) {
      opcode = opcodes[i];

      this.source.currentLocation = opcode.loc;
      firstLoc = firstLoc || opcode.loc;
      this[opcode.opcode].apply(this, opcode.args);
    }

    // Flush any trailing content that might be pending.
    this.source.currentLocation = firstLoc;
    this.pushSource('');

    /* istanbul ignore next */
    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
      throw new _exception2['default']('Compile completed with content left on stack');
    }

    if (!this.decorators.isEmpty()) {
      this.useDecorators = true;

      this.decorators.prepend(['var decorators = container.decorators, ', this.lookupPropertyFunctionVarDeclaration(), ';\n']);
      this.decorators.push('return fn;');

      if (asObject) {
        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
      } else {
        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
        this.decorators.push('}\n');
        this.decorators = this.decorators.merge();
      }
    } else {
      this.decorators = undefined;
    }

    var fn = this.createFunctionContext(asObject);
    if (!this.isChild) {
      var ret = {
        compiler: this.compilerInfo(),
        main: fn
      };

      if (this.decorators) {
        ret.main_d = this.decorators; // eslint-disable-line camelcase
        ret.useDecorators = true;
      }

      var _context = this.context;
      var programs = _context.programs;
      var decorators = _context.decorators;

      for (i = 0, l = programs.length; i < l; i++) {
        ret[i] = programs[i];
        if (decorators[i]) {
          ret[i + '_d'] = decorators[i];
          ret.useDecorators = true;
        }
      }

      if (this.environment.usePartial) {
        ret.usePartial = true;
      }
      if (this.options.data) {
        ret.useData = true;
      }
      if (this.useDepths) {
        ret.useDepths = true;
      }
      if (this.useBlockParams) {
        ret.useBlockParams = true;
      }
      if (this.options.compat) {
        ret.compat = true;
      }

      if (!asObject) {
        ret.compiler = JSON.stringify(ret.compiler);

        this.source.currentLocation = { start: { line: 1, column: 0 } };
        ret = this.objectLiteral(ret);

        if (options.srcName) {
          ret = ret.toStringWithSourceMap({ file: options.destName });
          ret.map = ret.map && ret.map.toString();
        } else {
          ret = ret.toString();
        }
      } else {
        ret.compilerOptions = this.options;
      }

      return ret;
    } else {
      return fn;
    }
  },

  preamble: function preamble() {
    // track the last context pushed into place to allow skipping the
    // getContext opcode when it would be a noop
    this.lastContext = 0;
    this.source = new _codeGen2['default'](this.options.srcName);
    this.decorators = new _codeGen2['default'](this.options.srcName);
  },

  createFunctionContext: function createFunctionContext(asObject) {
    // istanbul ignore next

    var _this = this;

    var varDeclarations = '';

    var locals = this.stackVars.concat(this.registers.list);
    if (locals.length > 0) {
      varDeclarations += ', ' + locals.join(', ');
    }

    // Generate minimizer alias mappings
    //
    // When using true SourceNodes, this will update all references to the given alias
    // as the source nodes are reused in situ. For the non-source node compilation mode,
    // aliases will not be used, but this case is already being run on the client and
    // we aren't concern about minimizing the template size.
    var aliasCount = 0;
    Object.keys(this.aliases).forEach(function (alias) {
      var node = _this.aliases[alias];
      if (node.children && node.referenceCount > 1) {
        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
        node.children[0] = 'alias' + aliasCount;
      }
    });

    if (this.lookupPropertyFunctionIsUsed) {
      varDeclarations += ', ' + this.lookupPropertyFunctionVarDeclaration();
    }

    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

    if (this.useBlockParams || this.useDepths) {
      params.push('blockParams');
    }
    if (this.useDepths) {
      params.push('depths');
    }

    // Perform a second pass over the output to merge content when possible
    var source = this.mergeSource(varDeclarations);

    if (asObject) {
      params.push(source);

      return Function.apply(this, params);
    } else {
      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
    }
  },
  mergeSource: function mergeSource(varDeclarations) {
    var isSimple = this.environment.isSimple,
        appendOnly = !this.forceBuffer,
        appendFirst = undefined,
        sourceSeen = undefined,
        bufferStart = undefined,
        bufferEnd = undefined;
    this.source.each(function (line) {
      if (line.appendToBuffer) {
        if (bufferStart) {
          line.prepend('  + ');
        } else {
          bufferStart = line;
        }
        bufferEnd = line;
      } else {
        if (bufferStart) {
          if (!sourceSeen) {
            appendFirst = true;
          } else {
            bufferStart.prepend('buffer += ');
          }
          bufferEnd.add(';');
          bufferStart = bufferEnd = undefined;
        }

        sourceSeen = true;
        if (!isSimple) {
          appendOnly = false;
        }
      }
    });

    if (appendOnly) {
      if (bufferStart) {
        bufferStart.prepend('return ');
        bufferEnd.add(';');
      } else if (!sourceSeen) {
        this.source.push('return "";');
      }
    } else {
      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

      if (bufferStart) {
        bufferStart.prepend('return buffer + ');
        bufferEnd.add(';');
      } else {
        this.source.push('return buffer;');
      }
    }

    if (varDeclarations) {
      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
    }

    return this.source.merge();
  },

  lookupPropertyFunctionVarDeclaration: function lookupPropertyFunctionVarDeclaration() {
    return '\n      lookupProperty = container.lookupProperty || function(parent, propertyName) {\n        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {\n          return parent[propertyName];\n        }\n        return undefined\n    }\n    '.trim();
  },

  // [blockValue]
  //
  // On stack, before: hash, inverse, program, value
  // On stack, after: return value of blockHelperMissing
  //
  // The purpose of this opcode is to take a block of the form
  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
  // replace it on the stack with the result of properly
  // invoking blockHelperMissing.
  blockValue: function blockValue(name) {
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs(name, 0, params);

    var blockName = this.popStack();
    params.splice(1, 0, blockName);

    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
  },

  // [ambiguousBlockValue]
  //
  // On stack, before: hash, inverse, program, value
  // Compiler value, before: lastHelper=value of last found helper, if any
  // On stack, after, if no lastHelper: same as [blockValue]
  // On stack, after, if lastHelper: value
  ambiguousBlockValue: function ambiguousBlockValue() {
    // We're being a bit cheeky and reusing the options value from the prior exec
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs('', 0, params, true);

    this.flushInline();

    var current = this.topStack();
    params.splice(1, 0, current);

    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
  },

  // [appendContent]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Appends the string value of `content` to the current buffer
  appendContent: function appendContent(content) {
    if (this.pendingContent) {
      content = this.pendingContent + content;
    } else {
      this.pendingLocation = this.source.currentLocation;
    }

    this.pendingContent = content;
  },

  // [append]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Coerces `value` to a String and appends it to the current buffer.
  //
  // If `value` is truthy, or 0, it is coerced into a string and appended
  // Otherwise, the empty string is appended
  append: function append() {
    if (this.isInline()) {
      this.replaceStack(function (current) {
        return [' != null ? ', current, ' : ""'];
      });

      this.pushSource(this.appendToBuffer(this.popStack()));
    } else {
      var local = this.popStack();
      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
      if (this.environment.isSimple) {
        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
      }
    }
  },

  // [appendEscaped]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Escape `value` and append it to the buffer
  appendEscaped: function appendEscaped() {
    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
  },

  // [getContext]
  //
  // On stack, before: ...
  // On stack, after: ...
  // Compiler value, after: lastContext=depth
  //
  // Set the value of the `lastContext` compiler value to the depth
  getContext: function getContext(depth) {
    this.lastContext = depth;
  },

  // [pushContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext, ...
  //
  // Pushes the value of the current context onto the stack.
  pushContext: function pushContext() {
    this.pushStackLiteral(this.contextName(this.lastContext));
  },

  // [lookupOnContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext[name], ...
  //
  // Looks up the value of `name` on the current context and pushes
  // it onto the stack.
  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
    var i = 0;

    if (!scoped && this.options.compat && !this.lastContext) {
      // The depthed query is expected to handle the undefined logic for the root level that
      // is implemented below, so we evaluate that directly in compat mode
      this.push(this.depthedLookup(parts[i++]));
    } else {
      this.pushContext();
    }

    this.resolvePath('context', parts, i, falsy, strict);
  },

  // [lookupBlockParam]
  //
  // On stack, before: ...
  // On stack, after: blockParam[name], ...
  //
  // Looks up the value of `parts` on the given block param and pushes
  // it onto the stack.
  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
    this.useBlockParams = true;

    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
    this.resolvePath('context', parts, 1);
  },

  // [lookupData]
  //
  // On stack, before: ...
  // On stack, after: data, ...
  //
  // Push the data lookup operator
  lookupData: function lookupData(depth, parts, strict) {
    if (!depth) {
      this.pushStackLiteral('data');
    } else {
      this.pushStackLiteral('container.data(data, ' + depth + ')');
    }

    this.resolvePath('data', parts, 0, true, strict);
  },

  resolvePath: function resolvePath(type, parts, startPartIndex, falsy, strict) {
    // istanbul ignore next

    var _this2 = this;

    if (this.options.strict || this.options.assumeObjects) {
      this.push(strictLookup(this.options.strict && strict, this, parts, startPartIndex, type));
      return;
    }

    var len = parts.length;

    var _loop = function (i) {
      /* eslint-disable no-loop-func */
      _this2.replaceStack(function (current) {
        var lookup = _this2.nameLookup(current, parts[i], type);
        // We want to ensure that zero and false are handled properly if the context (falsy flag)
        // needs to have the special handling for these values.
        if (!falsy) {
          return [' != null ? ', lookup, ' : ', current];
        } else {
          // Otherwise we can use generic falsy handling
          return [' && ', lookup];
        }
      });
      /* eslint-enable no-loop-func */
    };

    for (var i = startPartIndex; i < len; i++) {
      _loop(i);
    }
  },

  // [resolvePossibleLambda]
  //
  // On stack, before: value, ...
  // On stack, after: resolved value, ...
  //
  // If the `value` is a lambda, replace it on the stack by
  // the return value of the lambda
  resolvePossibleLambda: function resolvePossibleLambda() {
    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
  },

  // [pushStringParam]
  //
  // On stack, before: ...
  // On stack, after: string, currentContext, ...
  //
  // This opcode is designed for use in string mode, which
  // provides the string value of a parameter along with its
  // depth rather than resolving it immediately.
  pushStringParam: function pushStringParam(string, type) {
    this.pushContext();
    this.pushString(type);

    // If it's a subexpression, the string result
    // will be pushed after this opcode.
    if (type !== 'SubExpression') {
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    }
  },

  emptyHash: function emptyHash(omitEmpty) {
    if (this.trackIds) {
      this.push('{}'); // hashIds
    }
    if (this.stringParams) {
      this.push('{}'); // hashContexts
      this.push('{}'); // hashTypes
    }
    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
  },
  pushHash: function pushHash() {
    if (this.hash) {
      this.hashes.push(this.hash);
    }
    this.hash = { values: {}, types: [], contexts: [], ids: [] };
  },
  popHash: function popHash() {
    var hash = this.hash;
    this.hash = this.hashes.pop();

    if (this.trackIds) {
      this.push(this.objectLiteral(hash.ids));
    }
    if (this.stringParams) {
      this.push(this.objectLiteral(hash.contexts));
      this.push(this.objectLiteral(hash.types));
    }

    this.push(this.objectLiteral(hash.values));
  },

  // [pushString]
  //
  // On stack, before: ...
  // On stack, after: quotedString(string), ...
  //
  // Push a quoted version of `string` onto the stack
  pushString: function pushString(string) {
    this.pushStackLiteral(this.quotedString(string));
  },

  // [pushLiteral]
  //
  // On stack, before: ...
  // On stack, after: value, ...
  //
  // Pushes a value onto the stack. This operation prevents
  // the compiler from creating a temporary variable to hold
  // it.
  pushLiteral: function pushLiteral(value) {
    this.pushStackLiteral(value);
  },

  // [pushProgram]
  //
  // On stack, before: ...
  // On stack, after: program(guid), ...
  //
  // Push a program expression onto the stack. This takes
  // a compile-time guid and converts it into a runtime-accessible
  // expression.
  pushProgram: function pushProgram(guid) {
    if (guid != null) {
      this.pushStackLiteral(this.programExpression(guid));
    } else {
      this.pushStackLiteral(null);
    }
  },

  // [registerDecorator]
  //
  // On stack, before: hash, program, params..., ...
  // On stack, after: ...
  //
  // Pops off the decorator's parameters, invokes the decorator,
  // and inserts the decorator into the decorators list.
  registerDecorator: function registerDecorator(paramSize, name) {
    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
        options = this.setupHelperArgs(name, paramSize);

    // Store the resolved decorator in a variable and verify it is a function before
    // calling it. Without this, unregistered decorators can cause an unhandled TypeError
    // (calling undefined), which crashes the process — enabling Denial of Service.
    this.decorators.push(['var decorator = ', foundDecorator, ';']);
    this.decorators.push(['if (typeof decorator !== "function") { throw new Error(', this.quotedString('Missing decorator: "' + name + '"'), '); }']);
    this.decorators.push(['fn = ', this.decorators.functionCall('decorator', '', ['fn', 'props', 'container', options]), ' || fn;']);
  },

  // [invokeHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // Pops off the helper's parameters, invokes the helper,
  // and pushes the helper's return value onto the stack.
  //
  // If the helper is not found, `helperMissing` is called.
  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
    var nonHelper = this.popStack(),
        helper = this.setupHelper(paramSize, name);

    var possibleFunctionCalls = [];

    if (isSimple) {
      // direct call to helper
      possibleFunctionCalls.push(helper.name);
    }
    // call a function from the input object
    possibleFunctionCalls.push(nonHelper);
    if (!this.options.strict) {
      possibleFunctionCalls.push(this.aliasable('container.hooks.helperMissing'));
    }

    var functionLookupCode = ['(', this.itemsSeparatedBy(possibleFunctionCalls, '||'), ')'];
    var functionCall = this.source.functionCall(functionLookupCode, 'call', helper.callParams);
    this.push(functionCall);
  },

  itemsSeparatedBy: function itemsSeparatedBy(items, separator) {
    var result = [];
    result.push(items[0]);
    for (var i = 1; i < items.length; i++) {
      result.push(separator, items[i]);
    }
    return result;
  },
  // [invokeKnownHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // This operation is used when the helper is known to exist,
  // so a `helperMissing` fallback is not required.
  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
    var helper = this.setupHelper(paramSize, name);
    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
  },

  // [invokeAmbiguous]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of disambiguation
  //
  // This operation is used when an expression like `{{foo}}`
  // is provided, but we don't know at compile-time whether it
  // is a helper or a path.
  //
  // This operation emits more code than the other options,
  // and can be avoided by passing the `knownHelpers` and
  // `knownHelpersOnly` flags at compile-time.
  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
    this.useRegister('helper');

    var nonHelper = this.popStack();

    this.emptyHash();
    var helper = this.setupHelper(0, name, helperCall);

    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
    if (!this.options.strict) {
      lookup[0] = '(helper = ';
      lookup.push(' != null ? helper : ', this.aliasable('container.hooks.helperMissing'));
    }

    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
  },

  // [invokePartial]
  //
  // On stack, before: context, ...
  // On stack after: result of partial invocation
  //
  // This operation pops off a context, invokes a partial with that context,
  // and pushes the result of the invocation back.
  invokePartial: function invokePartial(isDynamic, name, indent) {
    var params = [],
        options = this.setupParams(name, 1, params);

    if (isDynamic) {
      name = this.popStack();
      delete options.name;
    }

    if (indent) {
      options.indent = JSON.stringify(indent);
    }
    options.helpers = 'helpers';
    options.partials = 'partials';
    options.decorators = 'container.decorators';

    if (!isDynamic) {
      params.unshift(this.nameLookup('partials', name, 'partial'));
    } else {
      params.unshift(name);
    }

    if (this.options.compat) {
      options.depths = 'depths';
    }
    options = this.objectLiteral(options);
    params.push(options);

    this.push(this.source.functionCall('container.invokePartial', '', params));
  },

  // [assignToHash]
  //
  // On stack, before: value, ..., hash, ...
  // On stack, after: ..., hash, ...
  //
  // Pops a value off the stack and assigns it to the current hash
  assignToHash: function assignToHash(key) {
    var value = this.popStack(),
        context = undefined,
        type = undefined,
        id = undefined;

    if (this.trackIds) {
      id = this.popStack();
    }
    if (this.stringParams) {
      type = this.popStack();
      context = this.popStack();
    }

    var hash = this.hash;
    if (context) {
      hash.contexts[key] = context;
    }
    if (type) {
      hash.types[key] = type;
    }
    if (id) {
      hash.ids[key] = id;
    }
    hash.values[key] = value;
  },

  pushId: function pushId(type, name, child) {
    if (type === 'BlockParam') {
      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
    } else if (type === 'PathExpression') {
      this.pushString(name);
    } else if (type === 'SubExpression') {
      this.pushStackLiteral('true');
    } else {
      this.pushStackLiteral('null');
    }
  },

  // HELPERS

  compiler: JavaScriptCompiler,

  compileChildren: function compileChildren(environment, options) {
    var children = environment.children,
        child = undefined,
        compiler = undefined;

    for (var i = 0, l = children.length; i < l; i++) {
      child = children[i];
      compiler = new this.compiler(); // eslint-disable-line new-cap

      var existing = this.matchExistingProgram(child);

      if (existing == null) {
        // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.push('') - 1;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
        this.context.decorators[index] = compiler.decorators;
        this.context.environments[index] = child;

        this.useDepths = this.useDepths || compiler.useDepths;
        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
        child.useDepths = this.useDepths;
        child.useBlockParams = this.useBlockParams;
      } else {
        child.index = existing.index;
        child.name = 'program' + existing.index;

        this.useDepths = this.useDepths || existing.useDepths;
        this.useBlockParams = this.useBlockParams || existing.useBlockParams;
      }
    }
  },
  matchExistingProgram: function matchExistingProgram(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return environment;
      }
    }
  },

  programExpression: function programExpression(guid) {
    var child = this.environment.children[guid],
        programParams = [child.index, 'data', child.blockParams];

    if (this.useBlockParams || this.useDepths) {
      programParams.push('blockParams');
    }
    if (this.useDepths) {
      programParams.push('depths');
    }

    return 'container.program(' + programParams.join(', ') + ')';
  },

  useRegister: function useRegister(name) {
    if (!this.registers[name]) {
      this.registers[name] = true;
      this.registers.list.push(name);
    }
  },

  push: function push(expr) {
    if (!(expr instanceof Literal)) {
      expr = this.source.wrap(expr);
    }

    this.inlineStack.push(expr);
    return expr;
  },

  pushStackLiteral: function pushStackLiteral(item) {
    this.push(new Literal(item));
  },

  pushSource: function pushSource(source) {
    if (this.pendingContent) {
      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
      this.pendingContent = undefined;
    }

    if (source) {
      this.source.push(source);
    }
  },

  replaceStack: function replaceStack(callback) {
    var prefix = ['('],
        stack = undefined,
        createdStack = undefined,
        usedLiteral = undefined;

    /* istanbul ignore next */
    if (!this.isInline()) {
      throw new _exception2['default']('replaceStack on non-inline');
    }

    // We want to merge the inline statement into the replacement statement via ','
    var top = this.popStack(true);

    if (top instanceof Literal) {
      // Literals do not need to be inlined
      stack = [top.value];
      prefix = ['(', stack];
      usedLiteral = true;
    } else {
      // Get or create the current stack name for use by the inline
      createdStack = true;
      var _name = this.incrStack();

      prefix = ['((', this.push(_name), ' = ', top, ')'];
      stack = this.topStack();
    }

    var item = callback.call(this, stack);

    if (!usedLiteral) {
      this.popStack();
    }
    if (createdStack) {
      this.stackSlot--;
    }
    this.push(prefix.concat(item, ')'));
  },

  incrStack: function incrStack() {
    this.stackSlot++;
    if (this.stackSlot > this.stackVars.length) {
      this.stackVars.push('stack' + this.stackSlot);
    }
    return this.topStackName();
  },
  topStackName: function topStackName() {
    return 'stack' + this.stackSlot;
  },
  flushInline: function flushInline() {
    var inlineStack = this.inlineStack;
    this.inlineStack = [];
    for (var i = 0, len = inlineStack.length; i < len; i++) {
      var entry = inlineStack[i];
      /* istanbul ignore if */
      if (entry instanceof Literal) {
        this.compileStack.push(entry);
      } else {
        var stack = this.incrStack();
        this.pushSource([stack, ' = ', entry, ';']);
        this.compileStack.push(stack);
      }
    }
  },
  isInline: function isInline() {
    return this.inlineStack.length;
  },

  popStack: function popStack(wrapped) {
    var inline = this.isInline(),
        item = (inline ? this.inlineStack : this.compileStack).pop();

    if (!wrapped && item instanceof Literal) {
      return item.value;
    } else {
      if (!inline) {
        /* istanbul ignore next */
        if (!this.stackSlot) {
          throw new _exception2['default']('Invalid stack pop');
        }
        this.stackSlot--;
      }
      return item;
    }
  },

  topStack: function topStack() {
    var stack = this.isInline() ? this.inlineStack : this.compileStack,
        item = stack[stack.length - 1];

    /* istanbul ignore if */
    if (item instanceof Literal) {
      return item.value;
    } else {
      return item;
    }
  },

  contextName: function contextName(context) {
    if (this.useDepths && context) {
      return 'depths[' + context + ']';
    } else {
      return 'depth' + context;
    }
  },

  quotedString: function quotedString(str) {
    return this.source.quotedString(str);
  },

  objectLiteral: function objectLiteral(obj) {
    return this.source.objectLiteral(obj);
  },

  aliasable: function aliasable(name) {
    var ret = this.aliases[name];
    if (ret) {
      ret.referenceCount++;
      return ret;
    }

    ret = this.aliases[name] = this.source.wrap(name);
    ret.aliasable = true;
    ret.referenceCount = 1;

    return ret;
  },

  setupHelper: function setupHelper(paramSize, name, blockHelper) {
    var params = [],
        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
    var foundHelper = this.nameLookup('helpers', name, 'helper'),
        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : (container.nullContext || {})');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: [callContext].concat(params)
    };
  },

  setupParams: function setupParams(helper, paramSize, params) {
    var options = {},
        contexts = [],
        types = [],
        ids = [],
        objectArgs = !params,
        param = undefined;

    if (objectArgs) {
      params = [];
    }

    options.name = this.quotedString(helper);
    options.hash = this.popStack();

    if (this.trackIds) {
      options.hashIds = this.popStack();
    }
    if (this.stringParams) {
      options.hashTypes = this.popStack();
      options.hashContexts = this.popStack();
    }

    var inverse = this.popStack(),
        program = this.popStack();

    // Avoid setting fn and inverse if neither are set. This allows
    // helpers to do a check for `if (options.fn)`
    if (program || inverse) {
      options.fn = program || 'container.noop';
      options.inverse = inverse || 'container.noop';
    }

    // The parameters go on to the stack in order (making sure that they are evaluated in order)
    // so we need to pop them off the stack in reverse order
    var i = paramSize;
    while (i--) {
      param = this.popStack();
      params[i] = param;

      if (this.trackIds) {
        ids[i] = this.popStack();
      }
      if (this.stringParams) {
        types[i] = this.popStack();
        contexts[i] = this.popStack();
      }
    }

    if (objectArgs) {
      options.args = this.source.generateArray(params);
    }

    if (this.trackIds) {
      options.ids = this.source.generateArray(ids);
    }
    if (this.stringParams) {
      options.types = this.source.generateArray(types);
      options.contexts = this.source.generateArray(contexts);
    }

    if (this.options.data) {
      options.data = 'data';
    }
    if (this.useBlockParams) {
      options.blockParams = 'blockParams';
    }
    return options;
  },

  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
    var options = this.setupParams(helper, paramSize, params);
    options.loc = JSON.stringify(this.source.currentLocation);
    options = this.objectLiteral(options);
    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return ['options=', options];
    } else if (params) {
      params.push(options);
      return '';
    } else {
      return options;
    }
  }
};

(function () {
  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for (var i = 0, l = reservedWords.length; i < l; i++) {
    compilerWords[reservedWords[i]] = true;
  }
})();

/**
 * @deprecated May be removed in the next major version
 */
JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
};

function strictLookup(requireTerminal, compiler, parts, startPartIndex, type) {
  var stack = compiler.popStack(),
      len = parts.length;
  if (requireTerminal) {
    len--;
  }

  for (var i = startPartIndex; i < len; i++) {
    stack = compiler.nameLookup(stack, parts[i], type);
  }

  if (requireTerminal) {
    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[len]), ', ', JSON.stringify(compiler.source.currentLocation), ' )'];
  } else {
    return stack;
  }
}

exports['default'] = JavaScriptCompiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2NvbXBpbGVyL2phdmFzY3JpcHQtY29tcGlsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztvQkFBb0QsU0FBUzs7eUJBQ3ZDLGNBQWM7Ozs7cUJBQ1osVUFBVTs7dUJBQ2QsWUFBWTs7OztBQUVoQyxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDdEIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDcEI7O0FBRUQsU0FBUyxrQkFBa0IsR0FBRyxFQUFFOztBQUVoQyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUc7OztBQUc3QixZQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFFLElBQUksZUFBZTtBQUM5QyxXQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDOUM7QUFDRCxlQUFhLEVBQUUsdUJBQVMsSUFBSSxFQUFFO0FBQzVCLFdBQU8sQ0FDTCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEVBQ2xDLFdBQVcsRUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNwQixHQUFHLENBQ0osQ0FBQztHQUNIOztBQUVELGNBQVksRUFBRSx3QkFBVztBQUN2QixRQUFNLFFBQVEsMEJBQW9CO1FBQ2hDLFFBQVEsR0FBRyx1QkFBaUIsUUFBUSxDQUFDLENBQUM7QUFDeEMsV0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3Qjs7QUFFRCxnQkFBYyxFQUFFLHdCQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFOztBQUVuRCxRQUFJLENBQUMsZUFBUSxNQUFNLENBQUMsRUFBRTtBQUNwQixZQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQjtBQUNELFVBQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRTVDLFFB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RSxjQUFjLEVBQUUsSUFBSSxFQUFFO0FBQzVFLE1BQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUU7TUFDN0IsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDckIsTUFBSSxlQUFlLEVBQUU7QUFDbkIsT0FBRyxFQUFFLENBQUM7R0FDUDs7QUFFRCxPQUFLLElBQUksQ0FBQyxHQUFHLGNBQWMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pDLFNBQUssR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDcEQ7O0FBRUQsTUFBSSxlQUFlLEVBQUU7QUFDbkIsV0FBTyxDQUNMLFFBQVEsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFDdEMsR0FBRyxFQUNILEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDakMsSUFBSSxFQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFDL0MsSUFBSSxDQUNMLENBQUM7R0FDSCxNQUFNO0FBQ0wsV0FBTyxLQUFLLENBQUM7R0FDZDtDQUNGOztxQkFFYyxrQkFBa0IiLCJmaWxlIjoiamF2YXNjcmlwdC1jb21waWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENPTVBJTEVSX1JFVklTSU9OLCBSRVZJU0lPTl9DSEFOR0VTIH0gZnJvbSAnLi4vYmFzZSc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4uL2V4Y2VwdGlvbic7XG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IENvZGVHZW4gZnJvbSAnLi9jb2RlLWdlbic7XG5cbmZ1bmN0aW9uIExpdGVyYWwodmFsdWUpIHtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBKYXZhU2NyaXB0Q29tcGlsZXIoKSB7fVxuXG5KYXZhU2NyaXB0Q29tcGlsZXIucHJvdG90eXBlID0ge1xuICAvLyBQVUJMSUMgQVBJOiBZb3UgY2FuIG92ZXJyaWRlIHRoZXNlIG1ldGhvZHMgaW4gYSBzdWJjbGFzcyB0byBwcm92aWRlXG4gIC8vIGFsdGVybmF0aXZlIGNvbXBpbGVkIGZvcm1zIGZvciBuYW1lIGxvb2t1cCBhbmQgYnVmZmVyaW5nIHNlbWFudGljc1xuICBuYW1lTG9va3VwOiBmdW5jdGlvbihwYXJlbnQsIG5hbWUgLyosICB0eXBlICovKSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lTG9va3VwKHBhcmVudCwgbmFtZSk7XG4gIH0sXG4gIGRlcHRoZWRMb29rdXA6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy5hbGlhc2FibGUoJ2NvbnRhaW5lci5sb29rdXAnKSxcbiAgICAgICcoZGVwdGhzLCAnLFxuICAgICAgSlNPTi5zdHJpbmdpZnkobmFtZSksXG4gICAgICAnKSdcbiAgICBdO1xuICB9LFxuXG4gIGNvbXBpbGVySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgcmV2aXNpb24gPSBDT01QSUxFUl9SRVZJU0lPTixcbiAgICAgIHZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tyZXZpc2lvbl07XG4gICAgcmV0dXJuIFtyZXZpc2lvbiwgdmVyc2lvbnNdO1xuICB9LFxuXG4gIGFwcGVuZFRvQnVmZmVyOiBmdW5jdGlvbihzb3VyY2UsIGxvY2F0aW9uLCBleHBsaWNpdCkge1xuICAgIC8vIEZvcmNlIGEgc291cmNlIGFzIHRoaXMgc2ltcGxpZmllcyB0aGUgbWVyZ2UgbG9naWMuXG4gICAgaWYgKCFpc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHNvdXJjZSA9IFtzb3VyY2VdO1xuICAgIH1cbiAgICBzb3VyY2UgPSB0aGlzLnNvdXJjZS53cmFwKHNvdXJjZSwgbG9jYXRpb24pO1xuXG4gICAgaWYgKHRoaXMuZW52aXJvbm1lbnQuaXNTaW1wbGUpIHtcbiAgICAgIHJldHVybiBbJ3JldHVybiAnLCBzb3VyY2UsICc7J107XG4gICAgfSBlbHNlIGlmIChleHBsaWNpdCkge1xuICAgICAgLy8gVGhpcyBpcyBhIGNhc2Ugd2hlcmUgdGhlIGJ1ZmZlciBvcGVyYXRpb24gb2NjdXJzIGFzIGEgY2hpbGQgb2YgYW5vdGhlclxuICAgICAgLy8gY29uc3RydWN0LCBnZW5lcmFsbHkgYnJhY2VzLiBXZSBoYXZlIHRvIGV4cGxpY2l0bHkgb3V0cHV0IHRoZXNlIGJ1ZmZlclxuICAgICAgLy8gb3BlcmF0aW9ucyB0byBlbnN1cmUgdGhhdCB0aGUgZW1pdHRlZCBjb2RlIGdvZXMgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24uXG4gICAgICByZXR1cm4gWydidWZmZXIgKz0gJywgc291cmNlLCAnOyddO1xuICAgIH0gZWxzZSB7XG4gICAgICBzb3VyY2UuYXBwZW5kVG9CdWZmZXIgPSB0cnVlO1xuICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9XG4gIH0sXG5cbiAgaW5pdGlhbGl6ZUJ1ZmZlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVvdGVkU3RyaW5nKCcnKTtcbiAgfSxcbiAgLy8gRU5EIFBVQkxJQyBBUElcbiAgaW50ZXJuYWxOYW1lTG9va3VwOiBmdW5jdGlvbihwYXJlbnQsIG5hbWUpIHtcbiAgICB0aGlzLmxvb2t1cFByb3BlcnR5RnVuY3Rpb25Jc1VzZWQgPSB0cnVlO1xuICAgIHJldHVybiBbJ2xvb2t1cFByb3BlcnR5KCcsIHBhcmVudCwgJywnLCBKU09OLnN0cmluZ2lmeShuYW1lKSwgJyknXTtcbiAgfSxcblxuICBsb29rdXBQcm9wZXJ0eUZ1bmN0aW9uSXNVc2VkOiBmYWxzZSxcblxuICBjb21waWxlOiBmdW5jdGlvbihlbnZpcm9ubWVudCwgb3B0aW9ucywgY29udGV4dCwgYXNPYmplY3QpIHtcbiAgICB0aGlzLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnN0cmluZ1BhcmFtcyA9IHRoaXMub3B0aW9ucy5zdHJpbmdQYXJhbXM7XG4gICAgdGhpcy50cmFja0lkcyA9IHRoaXMub3B0aW9ucy50cmFja0lkcztcbiAgICB0aGlzLnByZWNvbXBpbGUgPSAhYXNPYmplY3Q7XG5cbiAgICB0aGlzLm5hbWUgPSB0aGlzLmVudmlyb25tZW50Lm5hbWU7XG4gICAgdGhpcy5pc0NoaWxkID0gISFjb250ZXh0O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQgfHwge1xuICAgICAgZGVjb3JhdG9yczogW10sXG4gICAgICBwcm9ncmFtczogW10sXG4gICAgICBlbnZpcm9ubWVudHM6IFtdXG4gICAgfTtcblxuICAgIHRoaXMucHJlYW1ibGUoKTtcblxuICAgIHRoaXMuc3RhY2tTbG90ID0gMDtcbiAgICB0aGlzLnN0YWNrVmFycyA9IFtdO1xuICAgIHRoaXMuYWxpYXNlcyA9IHt9O1xuICAgIHRoaXMucmVnaXN0ZXJzID0geyBsaXN0OiBbXSB9O1xuICAgIHRoaXMuaGFzaGVzID0gW107XG4gICAgdGhpcy5jb21waWxlU3RhY2sgPSBbXTtcbiAgICB0aGlzLmlubGluZVN0YWNrID0gW107XG4gICAgdGhpcy5ibG9ja1BhcmFtcyA9IFtdO1xuXG4gICAgdGhpcy5jb21waWxlQ2hpbGRyZW4oZW52aXJvbm1lbnQsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy51c2VEZXB0aHMgPVxuICAgICAgdGhpcy51c2VEZXB0aHMgfHxcbiAgICAgIGVudmlyb25tZW50LnVzZURlcHRocyB8fFxuICAgICAgZW52aXJvbm1lbnQudXNlRGVjb3JhdG9ycyB8fFxuICAgICAgdGhpcy5vcHRpb25zLmNvbXBhdDtcbiAgICB0aGlzLnVzZUJsb2NrUGFyYW1zID0gdGhpcy51c2VCbG9ja1BhcmFtcyB8fCBlbnZpcm9ubWVudC51c2VCbG9ja1BhcmFtcztcblxuICAgIGxldCBvcGNvZGVzID0gZW52aXJvbm1lbnQub3Bjb2RlcyxcbiAgICAgIG9wY29kZSxcbiAgICAgIGZpcnN0TG9jLFxuICAgICAgaSxcbiAgICAgIGw7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gb3Bjb2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIG9wY29kZSA9IG9wY29kZXNbaV07XG5cbiAgICAgIHRoaXMuc291cmNlLmN1cnJlbnRMb2NhdGlvbiA9IG9wY29kZS5sb2M7XG4gICAgICBmaXJzdExvYyA9IGZpcnN0TG9jIHx8IG9wY29kZS5sb2M7XG4gICAgICB0aGlzW29wY29kZS5vcGNvZGVdLmFwcGx5KHRoaXMsIG9wY29kZS5hcmdzKTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCBhbnkgdHJhaWxpbmcgY29udGVudCB0aGF0IG1pZ2h0IGJlIHBlbmRpbmcuXG4gICAgdGhpcy5zb3VyY2UuY3VycmVudExvY2F0aW9uID0gZmlyc3RMb2M7XG4gICAgdGhpcy5wdXNoU291cmNlKCcnKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuc3RhY2tTbG90IHx8IHRoaXMuaW5saW5lU3RhY2subGVuZ3RoIHx8IHRoaXMuY29tcGlsZVN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignQ29tcGlsZSBjb21wbGV0ZWQgd2l0aCBjb250ZW50IGxlZnQgb24gc3RhY2snKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZGVjb3JhdG9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMudXNlRGVjb3JhdG9ycyA9IHRydWU7XG5cbiAgICAgIHRoaXMuZGVjb3JhdG9ycy5wcmVwZW5kKFtcbiAgICAgICAgJ3ZhciBkZWNvcmF0b3JzID0gY29udGFpbmVyLmRlY29yYXRvcnMsICcsXG4gICAgICAgIHRoaXMubG9va3VwUHJvcGVydHlGdW5jdGlvblZhckRlY2xhcmF0aW9uKCksXG4gICAgICAgICc7XFxuJ1xuICAgICAgXSk7XG4gICAgICB0aGlzLmRlY29yYXRvcnMucHVzaCgncmV0dXJuIGZuOycpO1xuXG4gICAgICBpZiAoYXNPYmplY3QpIHtcbiAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0gRnVuY3Rpb24uYXBwbHkodGhpcywgW1xuICAgICAgICAgICdmbicsXG4gICAgICAgICAgJ3Byb3BzJyxcbiAgICAgICAgICAnY29udGFpbmVyJyxcbiAgICAgICAgICAnZGVwdGgwJyxcbiAgICAgICAgICAnZGF0YScsXG4gICAgICAgICAgJ2Jsb2NrUGFyYW1zJyxcbiAgICAgICAgICAnZGVwdGhzJyxcbiAgICAgICAgICB0aGlzLmRlY29yYXRvcnMubWVyZ2UoKVxuICAgICAgICBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVjb3JhdG9ycy5wcmVwZW5kKFxuICAgICAgICAgICdmdW5jdGlvbihmbiwgcHJvcHMsIGNvbnRhaW5lciwgZGVwdGgwLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XFxuJ1xuICAgICAgICApO1xuICAgICAgICB0aGlzLmRlY29yYXRvcnMucHVzaCgnfVxcbicpO1xuICAgICAgICB0aGlzLmRlY29yYXRvcnMgPSB0aGlzLmRlY29yYXRvcnMubWVyZ2UoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWNvcmF0b3JzID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBmbiA9IHRoaXMuY3JlYXRlRnVuY3Rpb25Db250ZXh0KGFzT2JqZWN0KTtcbiAgICBpZiAoIXRoaXMuaXNDaGlsZCkge1xuICAgICAgbGV0IHJldCA9IHtcbiAgICAgICAgY29tcGlsZXI6IHRoaXMuY29tcGlsZXJJbmZvKCksXG4gICAgICAgIG1haW46IGZuXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldC5tYWluX2QgPSB0aGlzLmRlY29yYXRvcnM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIHJldC51c2VEZWNvcmF0b3JzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IHsgcHJvZ3JhbXMsIGRlY29yYXRvcnMgfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBwcm9ncmFtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgcmV0W2ldID0gcHJvZ3JhbXNbaV07XG4gICAgICAgIGlmIChkZWNvcmF0b3JzW2ldKSB7XG4gICAgICAgICAgcmV0W2kgKyAnX2QnXSA9IGRlY29yYXRvcnNbaV07XG4gICAgICAgICAgcmV0LnVzZURlY29yYXRvcnMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVudmlyb25tZW50LnVzZVBhcnRpYWwpIHtcbiAgICAgICAgcmV0LnVzZVBhcnRpYWwgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kYXRhKSB7XG4gICAgICAgIHJldC51c2VEYXRhID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnVzZURlcHRocykge1xuICAgICAgICByZXQudXNlRGVwdGhzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnVzZUJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHJldC51c2VCbG9ja1BhcmFtcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvbXBhdCkge1xuICAgICAgICByZXQuY29tcGF0ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhc09iamVjdCkge1xuICAgICAgICByZXQuY29tcGlsZXIgPSBKU09OLnN0cmluZ2lmeShyZXQuY29tcGlsZXIpO1xuXG4gICAgICAgIHRoaXMuc291cmNlLmN1cnJlbnRMb2NhdGlvbiA9IHsgc3RhcnQ6IHsgbGluZTogMSwgY29sdW1uOiAwIH0gfTtcbiAgICAgICAgcmV0ID0gdGhpcy5vYmplY3RMaXRlcmFsKHJldCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc3JjTmFtZSkge1xuICAgICAgICAgIHJldCA9IHJldC50b1N0cmluZ1dpdGhTb3VyY2VNYXAoeyBmaWxlOiBvcHRpb25zLmRlc3ROYW1lIH0pO1xuICAgICAgICAgIHJldC5tYXAgPSByZXQubWFwICYmIHJldC5tYXAudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSByZXQudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0LmNvbXBpbGVyT3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuO1xuICAgIH1cbiAgfSxcblxuICBwcmVhbWJsZTogZnVuY3Rpb24oKSB7XG4gICAgLy8gdHJhY2sgdGhlIGxhc3QgY29udGV4dCBwdXNoZWQgaW50byBwbGFjZSB0byBhbGxvdyBza2lwcGluZyB0aGVcbiAgICAvLyBnZXRDb250ZXh0IG9wY29kZSB3aGVuIGl0IHdvdWxkIGJlIGEgbm9vcFxuICAgIHRoaXMubGFzdENvbnRleHQgPSAwO1xuICAgIHRoaXMuc291cmNlID0gbmV3IENvZGVHZW4odGhpcy5vcHRpb25zLnNyY05hbWUpO1xuICAgIHRoaXMuZGVjb3JhdG9ycyA9IG5ldyBDb2RlR2VuKHRoaXMub3B0aW9ucy5zcmNOYW1lKTtcbiAgfSxcblxuICBjcmVhdGVGdW5jdGlvbkNvbnRleHQ6IGZ1bmN0aW9uKGFzT2JqZWN0KSB7XG4gICAgbGV0IHZhckRlY2xhcmF0aW9ucyA9ICcnO1xuXG4gICAgbGV0IGxvY2FscyA9IHRoaXMuc3RhY2tWYXJzLmNvbmNhdCh0aGlzLnJlZ2lzdGVycy5saXN0KTtcbiAgICBpZiAobG9jYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhckRlY2xhcmF0aW9ucyArPSAnLCAnICsgbG9jYWxzLmpvaW4oJywgJyk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgbWluaW1pemVyIGFsaWFzIG1hcHBpbmdzXG4gICAgLy9cbiAgICAvLyBXaGVuIHVzaW5nIHRydWUgU291cmNlTm9kZXMsIHRoaXMgd2lsbCB1cGRhdGUgYWxsIHJlZmVyZW5jZXMgdG8gdGhlIGdpdmVuIGFsaWFzXG4gICAgLy8gYXMgdGhlIHNvdXJjZSBub2RlcyBhcmUgcmV1c2VkIGluIHNpdHUuIEZvciB0aGUgbm9uLXNvdXJjZSBub2RlIGNvbXBpbGF0aW9uIG1vZGUsXG4gICAgLy8gYWxpYXNlcyB3aWxsIG5vdCBiZSB1c2VkLCBidXQgdGhpcyBjYXNlIGlzIGFscmVhZHkgYmVpbmcgcnVuIG9uIHRoZSBjbGllbnQgYW5kXG4gICAgLy8gd2UgYXJlbid0IGNvbmNlcm4gYWJvdXQgbWluaW1pemluZyB0aGUgdGVtcGxhdGUgc2l6ZS5cbiAgICBsZXQgYWxpYXNDb3VudCA9IDA7XG4gICAgT2JqZWN0LmtleXModGhpcy5hbGlhc2VzKS5mb3JFYWNoKGFsaWFzID0+IHtcbiAgICAgIGxldCBub2RlID0gdGhpcy5hbGlhc2VzW2FsaWFzXTtcbiAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUucmVmZXJlbmNlQ291bnQgPiAxKSB7XG4gICAgICAgIHZhckRlY2xhcmF0aW9ucyArPSAnLCBhbGlhcycgKyArK2FsaWFzQ291bnQgKyAnPScgKyBhbGlhcztcbiAgICAgICAgbm9kZS5jaGlsZHJlblswXSA9ICdhbGlhcycgKyBhbGlhc0NvdW50O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMubG9va3VwUHJvcGVydHlGdW5jdGlvbklzVXNlZCkge1xuICAgICAgdmFyRGVjbGFyYXRpb25zICs9ICcsICcgKyB0aGlzLmxvb2t1cFByb3BlcnR5RnVuY3Rpb25WYXJEZWNsYXJhdGlvbigpO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSBbJ2NvbnRhaW5lcicsICdkZXB0aDAnLCAnaGVscGVycycsICdwYXJ0aWFscycsICdkYXRhJ107XG5cbiAgICBpZiAodGhpcy51c2VCbG9ja1BhcmFtcyB8fCB0aGlzLnVzZURlcHRocykge1xuICAgICAgcGFyYW1zLnB1c2goJ2Jsb2NrUGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZURlcHRocykge1xuICAgICAgcGFyYW1zLnB1c2goJ2RlcHRocycpO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYSBzZWNvbmQgcGFzcyBvdmVyIHRoZSBvdXRwdXQgdG8gbWVyZ2UgY29udGVudCB3aGVuIHBvc3NpYmxlXG4gICAgbGV0IHNvdXJjZSA9IHRoaXMubWVyZ2VTb3VyY2UodmFyRGVjbGFyYXRpb25zKTtcblxuICAgIGlmIChhc09iamVjdCkge1xuICAgICAgcGFyYW1zLnB1c2goc291cmNlKTtcblxuICAgICAgcmV0dXJuIEZ1bmN0aW9uLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZS53cmFwKFtcbiAgICAgICAgJ2Z1bmN0aW9uKCcsXG4gICAgICAgIHBhcmFtcy5qb2luKCcsJyksXG4gICAgICAgICcpIHtcXG4gICcsXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgJ30nXG4gICAgICBdKTtcbiAgICB9XG4gIH0sXG4gIG1lcmdlU291cmNlOiBmdW5jdGlvbih2YXJEZWNsYXJhdGlvbnMpIHtcbiAgICBsZXQgaXNTaW1wbGUgPSB0aGlzLmVudmlyb25tZW50LmlzU2ltcGxlLFxuICAgICAgYXBwZW5kT25seSA9ICF0aGlzLmZvcmNlQnVmZmVyLFxuICAgICAgYXBwZW5kRmlyc3QsXG4gICAgICBzb3VyY2VTZWVuLFxuICAgICAgYnVmZmVyU3RhcnQsXG4gICAgICBidWZmZXJFbmQ7XG4gICAgdGhpcy5zb3VyY2UuZWFjaChsaW5lID0+IHtcbiAgICAgIGlmIChsaW5lLmFwcGVuZFRvQnVmZmVyKSB7XG4gICAgICAgIGlmIChidWZmZXJTdGFydCkge1xuICAgICAgICAgIGxpbmUucHJlcGVuZCgnICArICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZmZlclN0YXJ0ID0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBidWZmZXJFbmQgPSBsaW5lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGJ1ZmZlclN0YXJ0KSB7XG4gICAgICAgICAgaWYgKCFzb3VyY2VTZWVuKSB7XG4gICAgICAgICAgICBhcHBlbmRGaXJzdCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlclN0YXJ0LnByZXBlbmQoJ2J1ZmZlciArPSAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnVmZmVyRW5kLmFkZCgnOycpO1xuICAgICAgICAgIGJ1ZmZlclN0YXJ0ID0gYnVmZmVyRW5kID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc291cmNlU2VlbiA9IHRydWU7XG4gICAgICAgIGlmICghaXNTaW1wbGUpIHtcbiAgICAgICAgICBhcHBlbmRPbmx5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChhcHBlbmRPbmx5KSB7XG4gICAgICBpZiAoYnVmZmVyU3RhcnQpIHtcbiAgICAgICAgYnVmZmVyU3RhcnQucHJlcGVuZCgncmV0dXJuICcpO1xuICAgICAgICBidWZmZXJFbmQuYWRkKCc7Jyk7XG4gICAgICB9IGVsc2UgaWYgKCFzb3VyY2VTZWVuKSB7XG4gICAgICAgIHRoaXMuc291cmNlLnB1c2goJ3JldHVybiBcIlwiOycpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXJEZWNsYXJhdGlvbnMgKz1cbiAgICAgICAgJywgYnVmZmVyID0gJyArIChhcHBlbmRGaXJzdCA/ICcnIDogdGhpcy5pbml0aWFsaXplQnVmZmVyKCkpO1xuXG4gICAgICBpZiAoYnVmZmVyU3RhcnQpIHtcbiAgICAgICAgYnVmZmVyU3RhcnQucHJlcGVuZCgncmV0dXJuIGJ1ZmZlciArICcpO1xuICAgICAgICBidWZmZXJFbmQuYWRkKCc7Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNvdXJjZS5wdXNoKCdyZXR1cm4gYnVmZmVyOycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2YXJEZWNsYXJhdGlvbnMpIHtcbiAgICAgIHRoaXMuc291cmNlLnByZXBlbmQoXG4gICAgICAgICd2YXIgJyArIHZhckRlY2xhcmF0aW9ucy5zdWJzdHJpbmcoMikgKyAoYXBwZW5kRmlyc3QgPyAnJyA6ICc7XFxuJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLm1lcmdlKCk7XG4gIH0sXG5cbiAgbG9va3VwUHJvcGVydHlGdW5jdGlvblZhckRlY2xhcmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYFxuICAgICAgbG9va3VwUHJvcGVydHkgPSBjb250YWluZXIubG9va3VwUHJvcGVydHkgfHwgZnVuY3Rpb24ocGFyZW50LCBwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJlbnQsIHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gcGFyZW50W3Byb3BlcnR5TmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBgLnRyaW0oKTtcbiAgfSxcblxuICAvLyBbYmxvY2tWYWx1ZV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogaGFzaCwgaW52ZXJzZSwgcHJvZ3JhbSwgdmFsdWVcbiAgLy8gT24gc3RhY2ssIGFmdGVyOiByZXR1cm4gdmFsdWUgb2YgYmxvY2tIZWxwZXJNaXNzaW5nXG4gIC8vXG4gIC8vIFRoZSBwdXJwb3NlIG9mIHRoaXMgb3Bjb2RlIGlzIHRvIHRha2UgYSBibG9jayBvZiB0aGUgZm9ybVxuICAvLyBge3sjdGhpcy5mb299fS4uLnt7L3RoaXMuZm9vfX1gLCByZXNvbHZlIHRoZSB2YWx1ZSBvZiBgZm9vYCwgYW5kXG4gIC8vIHJlcGxhY2UgaXQgb24gdGhlIHN0YWNrIHdpdGggdGhlIHJlc3VsdCBvZiBwcm9wZXJseVxuICAvLyBpbnZva2luZyBibG9ja0hlbHBlck1pc3NpbmcuXG4gIGJsb2NrVmFsdWU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBsZXQgYmxvY2tIZWxwZXJNaXNzaW5nID0gdGhpcy5hbGlhc2FibGUoXG4gICAgICAgICdjb250YWluZXIuaG9va3MuYmxvY2tIZWxwZXJNaXNzaW5nJ1xuICAgICAgKSxcbiAgICAgIHBhcmFtcyA9IFt0aGlzLmNvbnRleHROYW1lKDApXTtcbiAgICB0aGlzLnNldHVwSGVscGVyQXJncyhuYW1lLCAwLCBwYXJhbXMpO1xuXG4gICAgbGV0IGJsb2NrTmFtZSA9IHRoaXMucG9wU3RhY2soKTtcbiAgICBwYXJhbXMuc3BsaWNlKDEsIDAsIGJsb2NrTmFtZSk7XG5cbiAgICB0aGlzLnB1c2godGhpcy5zb3VyY2UuZnVuY3Rpb25DYWxsKGJsb2NrSGVscGVyTWlzc2luZywgJ2NhbGwnLCBwYXJhbXMpKTtcbiAgfSxcblxuICAvLyBbYW1iaWd1b3VzQmxvY2tWYWx1ZV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogaGFzaCwgaW52ZXJzZSwgcHJvZ3JhbSwgdmFsdWVcbiAgLy8gQ29tcGlsZXIgdmFsdWUsIGJlZm9yZTogbGFzdEhlbHBlcj12YWx1ZSBvZiBsYXN0IGZvdW5kIGhlbHBlciwgaWYgYW55XG4gIC8vIE9uIHN0YWNrLCBhZnRlciwgaWYgbm8gbGFzdEhlbHBlcjogc2FtZSBhcyBbYmxvY2tWYWx1ZV1cbiAgLy8gT24gc3RhY2ssIGFmdGVyLCBpZiBsYXN0SGVscGVyOiB2YWx1ZVxuICBhbWJpZ3VvdXNCbG9ja1ZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAvLyBXZSdyZSBiZWluZyBhIGJpdCBjaGVla3kgYW5kIHJldXNpbmcgdGhlIG9wdGlvbnMgdmFsdWUgZnJvbSB0aGUgcHJpb3IgZXhlY1xuICAgIGxldCBibG9ja0hlbHBlck1pc3NpbmcgPSB0aGlzLmFsaWFzYWJsZShcbiAgICAgICAgJ2NvbnRhaW5lci5ob29rcy5ibG9ja0hlbHBlck1pc3NpbmcnXG4gICAgICApLFxuICAgICAgcGFyYW1zID0gW3RoaXMuY29udGV4dE5hbWUoMCldO1xuICAgIHRoaXMuc2V0dXBIZWxwZXJBcmdzKCcnLCAwLCBwYXJhbXMsIHRydWUpO1xuXG4gICAgdGhpcy5mbHVzaElubGluZSgpO1xuXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLnRvcFN0YWNrKCk7XG4gICAgcGFyYW1zLnNwbGljZSgxLCAwLCBjdXJyZW50KTtcblxuICAgIHRoaXMucHVzaFNvdXJjZShbXG4gICAgICAnaWYgKCEnLFxuICAgICAgdGhpcy5sYXN0SGVscGVyLFxuICAgICAgJykgeyAnLFxuICAgICAgY3VycmVudCxcbiAgICAgICcgPSAnLFxuICAgICAgdGhpcy5zb3VyY2UuZnVuY3Rpb25DYWxsKGJsb2NrSGVscGVyTWlzc2luZywgJ2NhbGwnLCBwYXJhbXMpLFxuICAgICAgJ30nXG4gICAgXSk7XG4gIH0sXG5cbiAgLy8gW2FwcGVuZENvbnRlbnRdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLlxuICAvL1xuICAvLyBBcHBlbmRzIHRoZSBzdHJpbmcgdmFsdWUgb2YgYGNvbnRlbnRgIHRvIHRoZSBjdXJyZW50IGJ1ZmZlclxuICBhcHBlbmRDb250ZW50OiBmdW5jdGlvbihjb250ZW50KSB7XG4gICAgaWYgKHRoaXMucGVuZGluZ0NvbnRlbnQpIHtcbiAgICAgIGNvbnRlbnQgPSB0aGlzLnBlbmRpbmdDb250ZW50ICsgY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZW5kaW5nTG9jYXRpb24gPSB0aGlzLnNvdXJjZS5jdXJyZW50TG9jYXRpb247XG4gICAgfVxuXG4gICAgdGhpcy5wZW5kaW5nQ29udGVudCA9IGNvbnRlbnQ7XG4gIH0sXG5cbiAgLy8gW2FwcGVuZF1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogdmFsdWUsIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLlxuICAvL1xuICAvLyBDb2VyY2VzIGB2YWx1ZWAgdG8gYSBTdHJpbmcgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIGN1cnJlbnQgYnVmZmVyLlxuICAvL1xuICAvLyBJZiBgdmFsdWVgIGlzIHRydXRoeSwgb3IgMCwgaXQgaXMgY29lcmNlZCBpbnRvIGEgc3RyaW5nIGFuZCBhcHBlbmRlZFxuICAvLyBPdGhlcndpc2UsIHRoZSBlbXB0eSBzdHJpbmcgaXMgYXBwZW5kZWRcbiAgYXBwZW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0lubGluZSgpKSB7XG4gICAgICB0aGlzLnJlcGxhY2VTdGFjayhjdXJyZW50ID0+IFsnICE9IG51bGwgPyAnLCBjdXJyZW50LCAnIDogXCJcIiddKTtcblxuICAgICAgdGhpcy5wdXNoU291cmNlKHRoaXMuYXBwZW5kVG9CdWZmZXIodGhpcy5wb3BTdGFjaygpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBsb2NhbCA9IHRoaXMucG9wU3RhY2soKTtcbiAgICAgIHRoaXMucHVzaFNvdXJjZShbXG4gICAgICAgICdpZiAoJyxcbiAgICAgICAgbG9jYWwsXG4gICAgICAgICcgIT0gbnVsbCkgeyAnLFxuICAgICAgICB0aGlzLmFwcGVuZFRvQnVmZmVyKGxvY2FsLCB1bmRlZmluZWQsIHRydWUpLFxuICAgICAgICAnIH0nXG4gICAgICBdKTtcbiAgICAgIGlmICh0aGlzLmVudmlyb25tZW50LmlzU2ltcGxlKSB7XG4gICAgICAgIHRoaXMucHVzaFNvdXJjZShbXG4gICAgICAgICAgJ2Vsc2UgeyAnLFxuICAgICAgICAgIHRoaXMuYXBwZW5kVG9CdWZmZXIoXCInJ1wiLCB1bmRlZmluZWQsIHRydWUpLFxuICAgICAgICAgICcgfSdcbiAgICAgICAgXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFthcHBlbmRFc2NhcGVkXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiB2YWx1ZSwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogLi4uXG4gIC8vXG4gIC8vIEVzY2FwZSBgdmFsdWVgIGFuZCBhcHBlbmQgaXQgdG8gdGhlIGJ1ZmZlclxuICBhcHBlbmRFc2NhcGVkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnB1c2hTb3VyY2UoXG4gICAgICB0aGlzLmFwcGVuZFRvQnVmZmVyKFtcbiAgICAgICAgdGhpcy5hbGlhc2FibGUoJ2NvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uJyksXG4gICAgICAgICcoJyxcbiAgICAgICAgdGhpcy5wb3BTdGFjaygpLFxuICAgICAgICAnKSdcbiAgICAgIF0pXG4gICAgKTtcbiAgfSxcblxuICAvLyBbZ2V0Q29udGV4dF1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogLi4uXG4gIC8vIENvbXBpbGVyIHZhbHVlLCBhZnRlcjogbGFzdENvbnRleHQ9ZGVwdGhcbiAgLy9cbiAgLy8gU2V0IHRoZSB2YWx1ZSBvZiB0aGUgYGxhc3RDb250ZXh0YCBjb21waWxlciB2YWx1ZSB0byB0aGUgZGVwdGhcbiAgZ2V0Q29udGV4dDogZnVuY3Rpb24oZGVwdGgpIHtcbiAgICB0aGlzLmxhc3RDb250ZXh0ID0gZGVwdGg7XG4gIH0sXG5cbiAgLy8gW3B1c2hDb250ZXh0XVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBjdXJyZW50Q29udGV4dCwgLi4uXG4gIC8vXG4gIC8vIFB1c2hlcyB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnQgY29udGV4dCBvbnRvIHRoZSBzdGFjay5cbiAgcHVzaENvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbCh0aGlzLmNvbnRleHROYW1lKHRoaXMubGFzdENvbnRleHQpKTtcbiAgfSxcblxuICAvLyBbbG9va3VwT25Db250ZXh0XVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBjdXJyZW50Q29udGV4dFtuYW1lXSwgLi4uXG4gIC8vXG4gIC8vIExvb2tzIHVwIHRoZSB2YWx1ZSBvZiBgbmFtZWAgb24gdGhlIGN1cnJlbnQgY29udGV4dCBhbmQgcHVzaGVzXG4gIC8vIGl0IG9udG8gdGhlIHN0YWNrLlxuICBsb29rdXBPbkNvbnRleHQ6IGZ1bmN0aW9uKHBhcnRzLCBmYWxzeSwgc3RyaWN0LCBzY29wZWQpIHtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICBpZiAoIXNjb3BlZCAmJiB0aGlzLm9wdGlvbnMuY29tcGF0ICYmICF0aGlzLmxhc3RDb250ZXh0KSB7XG4gICAgICAvLyBUaGUgZGVwdGhlZCBxdWVyeSBpcyBleHBlY3RlZCB0byBoYW5kbGUgdGhlIHVuZGVmaW5lZCBsb2dpYyBmb3IgdGhlIHJvb3QgbGV2ZWwgdGhhdFxuICAgICAgLy8gaXMgaW1wbGVtZW50ZWQgYmVsb3csIHNvIHdlIGV2YWx1YXRlIHRoYXQgZGlyZWN0bHkgaW4gY29tcGF0IG1vZGVcbiAgICAgIHRoaXMucHVzaCh0aGlzLmRlcHRoZWRMb29rdXAocGFydHNbaSsrXSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnB1c2hDb250ZXh0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5yZXNvbHZlUGF0aCgnY29udGV4dCcsIHBhcnRzLCBpLCBmYWxzeSwgc3RyaWN0KTtcbiAgfSxcblxuICAvLyBbbG9va3VwQmxvY2tQYXJhbV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogYmxvY2tQYXJhbVtuYW1lXSwgLi4uXG4gIC8vXG4gIC8vIExvb2tzIHVwIHRoZSB2YWx1ZSBvZiBgcGFydHNgIG9uIHRoZSBnaXZlbiBibG9jayBwYXJhbSBhbmQgcHVzaGVzXG4gIC8vIGl0IG9udG8gdGhlIHN0YWNrLlxuICBsb29rdXBCbG9ja1BhcmFtOiBmdW5jdGlvbihibG9ja1BhcmFtSWQsIHBhcnRzKSB7XG4gICAgdGhpcy51c2VCbG9ja1BhcmFtcyA9IHRydWU7XG5cbiAgICB0aGlzLnB1c2goWydibG9ja1BhcmFtc1snLCBibG9ja1BhcmFtSWRbMF0sICddWycsIGJsb2NrUGFyYW1JZFsxXSwgJ10nXSk7XG4gICAgdGhpcy5yZXNvbHZlUGF0aCgnY29udGV4dCcsIHBhcnRzLCAxKTtcbiAgfSxcblxuICAvLyBbbG9va3VwRGF0YV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogZGF0YSwgLi4uXG4gIC8vXG4gIC8vIFB1c2ggdGhlIGRhdGEgbG9va3VwIG9wZXJhdG9yXG4gIGxvb2t1cERhdGE6IGZ1bmN0aW9uKGRlcHRoLCBwYXJ0cywgc3RyaWN0KSB7XG4gICAgaWYgKCFkZXB0aCkge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKCdkYXRhJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbCgnY29udGFpbmVyLmRhdGEoZGF0YSwgJyArIGRlcHRoICsgJyknKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc29sdmVQYXRoKCdkYXRhJywgcGFydHMsIDAsIHRydWUsIHN0cmljdCk7XG4gIH0sXG5cbiAgcmVzb2x2ZVBhdGg6IGZ1bmN0aW9uKHR5cGUsIHBhcnRzLCBzdGFydFBhcnRJbmRleCwgZmFsc3ksIHN0cmljdCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RyaWN0IHx8IHRoaXMub3B0aW9ucy5hc3N1bWVPYmplY3RzKSB7XG4gICAgICB0aGlzLnB1c2goXG4gICAgICAgIHN0cmljdExvb2t1cChcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RyaWN0ICYmIHN0cmljdCxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHBhcnRzLFxuICAgICAgICAgIHN0YXJ0UGFydEluZGV4LFxuICAgICAgICAgIHR5cGVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGVuID0gcGFydHMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFBhcnRJbmRleDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1sb29wLWZ1bmMgKi9cbiAgICAgIHRoaXMucmVwbGFjZVN0YWNrKGN1cnJlbnQgPT4ge1xuICAgICAgICBsZXQgbG9va3VwID0gdGhpcy5uYW1lTG9va3VwKGN1cnJlbnQsIHBhcnRzW2ldLCB0eXBlKTtcbiAgICAgICAgLy8gV2Ugd2FudCB0byBlbnN1cmUgdGhhdCB6ZXJvIGFuZCBmYWxzZSBhcmUgaGFuZGxlZCBwcm9wZXJseSBpZiB0aGUgY29udGV4dCAoZmFsc3kgZmxhZylcbiAgICAgICAgLy8gbmVlZHMgdG8gaGF2ZSB0aGUgc3BlY2lhbCBoYW5kbGluZyBmb3IgdGhlc2UgdmFsdWVzLlxuICAgICAgICBpZiAoIWZhbHN5KSB7XG4gICAgICAgICAgcmV0dXJuIFsnICE9IG51bGwgPyAnLCBsb29rdXAsICcgOiAnLCBjdXJyZW50XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2Ugd2UgY2FuIHVzZSBnZW5lcmljIGZhbHN5IGhhbmRsaW5nXG4gICAgICAgICAgcmV0dXJuIFsnICYmICcsIGxvb2t1cF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1sb29wLWZ1bmMgKi9cbiAgICB9XG4gIH0sXG5cbiAgLy8gW3Jlc29sdmVQb3NzaWJsZUxhbWJkYV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogdmFsdWUsIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IHJlc29sdmVkIHZhbHVlLCAuLi5cbiAgLy9cbiAgLy8gSWYgdGhlIGB2YWx1ZWAgaXMgYSBsYW1iZGEsIHJlcGxhY2UgaXQgb24gdGhlIHN0YWNrIGJ5XG4gIC8vIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhbWJkYVxuICByZXNvbHZlUG9zc2libGVMYW1iZGE6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHVzaChbXG4gICAgICB0aGlzLmFsaWFzYWJsZSgnY29udGFpbmVyLmxhbWJkYScpLFxuICAgICAgJygnLFxuICAgICAgdGhpcy5wb3BTdGFjaygpLFxuICAgICAgJywgJyxcbiAgICAgIHRoaXMuY29udGV4dE5hbWUoMCksXG4gICAgICAnKSdcbiAgICBdKTtcbiAgfSxcblxuICAvLyBbcHVzaFN0cmluZ1BhcmFtXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBzdHJpbmcsIGN1cnJlbnRDb250ZXh0LCAuLi5cbiAgLy9cbiAgLy8gVGhpcyBvcGNvZGUgaXMgZGVzaWduZWQgZm9yIHVzZSBpbiBzdHJpbmcgbW9kZSwgd2hpY2hcbiAgLy8gcHJvdmlkZXMgdGhlIHN0cmluZyB2YWx1ZSBvZiBhIHBhcmFtZXRlciBhbG9uZyB3aXRoIGl0c1xuICAvLyBkZXB0aCByYXRoZXIgdGhhbiByZXNvbHZpbmcgaXQgaW1tZWRpYXRlbHkuXG4gIHB1c2hTdHJpbmdQYXJhbTogZnVuY3Rpb24oc3RyaW5nLCB0eXBlKSB7XG4gICAgdGhpcy5wdXNoQ29udGV4dCgpO1xuICAgIHRoaXMucHVzaFN0cmluZyh0eXBlKTtcblxuICAgIC8vIElmIGl0J3MgYSBzdWJleHByZXNzaW9uLCB0aGUgc3RyaW5nIHJlc3VsdFxuICAgIC8vIHdpbGwgYmUgcHVzaGVkIGFmdGVyIHRoaXMgb3Bjb2RlLlxuICAgIGlmICh0eXBlICE9PSAnU3ViRXhwcmVzc2lvbicpIHtcbiAgICAgIGlmICh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLnB1c2hTdHJpbmcoc3RyaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbChzdHJpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlbXB0eUhhc2g6IGZ1bmN0aW9uKG9taXRFbXB0eSkge1xuICAgIGlmICh0aGlzLnRyYWNrSWRzKSB7XG4gICAgICB0aGlzLnB1c2goJ3t9Jyk7IC8vIGhhc2hJZHNcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICB0aGlzLnB1c2goJ3t9Jyk7IC8vIGhhc2hDb250ZXh0c1xuICAgICAgdGhpcy5wdXNoKCd7fScpOyAvLyBoYXNoVHlwZXNcbiAgICB9XG4gICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKG9taXRFbXB0eSA/ICd1bmRlZmluZWQnIDogJ3t9Jyk7XG4gIH0sXG4gIHB1c2hIYXNoOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5oYXNoKSB7XG4gICAgICB0aGlzLmhhc2hlcy5wdXNoKHRoaXMuaGFzaCk7XG4gICAgfVxuICAgIHRoaXMuaGFzaCA9IHsgdmFsdWVzOiB7fSwgdHlwZXM6IFtdLCBjb250ZXh0czogW10sIGlkczogW10gfTtcbiAgfSxcbiAgcG9wSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgbGV0IGhhc2ggPSB0aGlzLmhhc2g7XG4gICAgdGhpcy5oYXNoID0gdGhpcy5oYXNoZXMucG9wKCk7XG5cbiAgICBpZiAodGhpcy50cmFja0lkcykge1xuICAgICAgdGhpcy5wdXNoKHRoaXMub2JqZWN0TGl0ZXJhbChoYXNoLmlkcykpO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdHJpbmdQYXJhbXMpIHtcbiAgICAgIHRoaXMucHVzaCh0aGlzLm9iamVjdExpdGVyYWwoaGFzaC5jb250ZXh0cykpO1xuICAgICAgdGhpcy5wdXNoKHRoaXMub2JqZWN0TGl0ZXJhbChoYXNoLnR5cGVzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoKHRoaXMub2JqZWN0TGl0ZXJhbChoYXNoLnZhbHVlcykpO1xuICB9LFxuXG4gIC8vIFtwdXNoU3RyaW5nXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBxdW90ZWRTdHJpbmcoc3RyaW5nKSwgLi4uXG4gIC8vXG4gIC8vIFB1c2ggYSBxdW90ZWQgdmVyc2lvbiBvZiBgc3RyaW5nYCBvbnRvIHRoZSBzdGFja1xuICBwdXNoU3RyaW5nOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB0aGlzLnB1c2hTdGFja0xpdGVyYWwodGhpcy5xdW90ZWRTdHJpbmcoc3RyaW5nKSk7XG4gIH0sXG5cbiAgLy8gW3B1c2hMaXRlcmFsXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiB2YWx1ZSwgLi4uXG4gIC8vXG4gIC8vIFB1c2hlcyBhIHZhbHVlIG9udG8gdGhlIHN0YWNrLiBUaGlzIG9wZXJhdGlvbiBwcmV2ZW50c1xuICAvLyB0aGUgY29tcGlsZXIgZnJvbSBjcmVhdGluZyBhIHRlbXBvcmFyeSB2YXJpYWJsZSB0byBob2xkXG4gIC8vIGl0LlxuICBwdXNoTGl0ZXJhbDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB0aGlzLnB1c2hTdGFja0xpdGVyYWwodmFsdWUpO1xuICB9LFxuXG4gIC8vIFtwdXNoUHJvZ3JhbV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogcHJvZ3JhbShndWlkKSwgLi4uXG4gIC8vXG4gIC8vIFB1c2ggYSBwcm9ncmFtIGV4cHJlc3Npb24gb250byB0aGUgc3RhY2suIFRoaXMgdGFrZXNcbiAgLy8gYSBjb21waWxlLXRpbWUgZ3VpZCBhbmQgY29udmVydHMgaXQgaW50byBhIHJ1bnRpbWUtYWNjZXNzaWJsZVxuICAvLyBleHByZXNzaW9uLlxuICBwdXNoUHJvZ3JhbTogZnVuY3Rpb24oZ3VpZCkge1xuICAgIGlmIChndWlkICE9IG51bGwpIHtcbiAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbCh0aGlzLnByb2dyYW1FeHByZXNzaW9uKGd1aWQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKG51bGwpO1xuICAgIH1cbiAgfSxcblxuICAvLyBbcmVnaXN0ZXJEZWNvcmF0b3JdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IGhhc2gsIHByb2dyYW0sIHBhcmFtcy4uLiwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogLi4uXG4gIC8vXG4gIC8vIFBvcHMgb2ZmIHRoZSBkZWNvcmF0b3IncyBwYXJhbWV0ZXJzLCBpbnZva2VzIHRoZSBkZWNvcmF0b3IsXG4gIC8vIGFuZCBpbnNlcnRzIHRoZSBkZWNvcmF0b3IgaW50byB0aGUgZGVjb3JhdG9ycyBsaXN0LlxuICByZWdpc3RlckRlY29yYXRvcihwYXJhbVNpemUsIG5hbWUpIHtcbiAgICBsZXQgZm91bmREZWNvcmF0b3IgPSB0aGlzLm5hbWVMb29rdXAoJ2RlY29yYXRvcnMnLCBuYW1lLCAnZGVjb3JhdG9yJyksXG4gICAgICBvcHRpb25zID0gdGhpcy5zZXR1cEhlbHBlckFyZ3MobmFtZSwgcGFyYW1TaXplKTtcblxuICAgIC8vIFN0b3JlIHRoZSByZXNvbHZlZCBkZWNvcmF0b3IgaW4gYSB2YXJpYWJsZSBhbmQgdmVyaWZ5IGl0IGlzIGEgZnVuY3Rpb24gYmVmb3JlXG4gICAgLy8gY2FsbGluZyBpdC4gV2l0aG91dCB0aGlzLCB1bnJlZ2lzdGVyZWQgZGVjb3JhdG9ycyBjYW4gY2F1c2UgYW4gdW5oYW5kbGVkIFR5cGVFcnJvclxuICAgIC8vIChjYWxsaW5nIHVuZGVmaW5lZCksIHdoaWNoIGNyYXNoZXMgdGhlIHByb2Nlc3Mg4oCUIGVuYWJsaW5nIERlbmlhbCBvZiBTZXJ2aWNlLlxuICAgIHRoaXMuZGVjb3JhdG9ycy5wdXNoKFsndmFyIGRlY29yYXRvciA9ICcsIGZvdW5kRGVjb3JhdG9yLCAnOyddKTtcbiAgICB0aGlzLmRlY29yYXRvcnMucHVzaChbXG4gICAgICAnaWYgKHR5cGVvZiBkZWNvcmF0b3IgIT09IFwiZnVuY3Rpb25cIikgeyB0aHJvdyBuZXcgRXJyb3IoJyxcbiAgICAgIHRoaXMucXVvdGVkU3RyaW5nKCdNaXNzaW5nIGRlY29yYXRvcjogXCInICsgbmFtZSArICdcIicpLFxuICAgICAgJyk7IH0nXG4gICAgXSk7XG4gICAgdGhpcy5kZWNvcmF0b3JzLnB1c2goW1xuICAgICAgJ2ZuID0gJyxcbiAgICAgIHRoaXMuZGVjb3JhdG9ycy5mdW5jdGlvbkNhbGwoJ2RlY29yYXRvcicsICcnLCBbXG4gICAgICAgICdmbicsXG4gICAgICAgICdwcm9wcycsXG4gICAgICAgICdjb250YWluZXInLFxuICAgICAgICBvcHRpb25zXG4gICAgICBdKSxcbiAgICAgICcgfHwgZm47J1xuICAgIF0pO1xuICB9LFxuXG4gIC8vIFtpbnZva2VIZWxwZXJdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IGhhc2gsIGludmVyc2UsIHByb2dyYW0sIHBhcmFtcy4uLiwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogcmVzdWx0IG9mIGhlbHBlciBpbnZvY2F0aW9uXG4gIC8vXG4gIC8vIFBvcHMgb2ZmIHRoZSBoZWxwZXIncyBwYXJhbWV0ZXJzLCBpbnZva2VzIHRoZSBoZWxwZXIsXG4gIC8vIGFuZCBwdXNoZXMgdGhlIGhlbHBlcidzIHJldHVybiB2YWx1ZSBvbnRvIHRoZSBzdGFjay5cbiAgLy9cbiAgLy8gSWYgdGhlIGhlbHBlciBpcyBub3QgZm91bmQsIGBoZWxwZXJNaXNzaW5nYCBpcyBjYWxsZWQuXG4gIGludm9rZUhlbHBlcjogZnVuY3Rpb24ocGFyYW1TaXplLCBuYW1lLCBpc1NpbXBsZSkge1xuICAgIGxldCBub25IZWxwZXIgPSB0aGlzLnBvcFN0YWNrKCksXG4gICAgICBoZWxwZXIgPSB0aGlzLnNldHVwSGVscGVyKHBhcmFtU2l6ZSwgbmFtZSk7XG5cbiAgICBsZXQgcG9zc2libGVGdW5jdGlvbkNhbGxzID0gW107XG5cbiAgICBpZiAoaXNTaW1wbGUpIHtcbiAgICAgIC8vIGRpcmVjdCBjYWxsIHRvIGhlbHBlclxuICAgICAgcG9zc2libGVGdW5jdGlvbkNhbGxzLnB1c2goaGVscGVyLm5hbWUpO1xuICAgIH1cbiAgICAvLyBjYWxsIGEgZnVuY3Rpb24gZnJvbSB0aGUgaW5wdXQgb2JqZWN0XG4gICAgcG9zc2libGVGdW5jdGlvbkNhbGxzLnB1c2gobm9uSGVscGVyKTtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgIHBvc3NpYmxlRnVuY3Rpb25DYWxscy5wdXNoKFxuICAgICAgICB0aGlzLmFsaWFzYWJsZSgnY29udGFpbmVyLmhvb2tzLmhlbHBlck1pc3NpbmcnKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgZnVuY3Rpb25Mb29rdXBDb2RlID0gW1xuICAgICAgJygnLFxuICAgICAgdGhpcy5pdGVtc1NlcGFyYXRlZEJ5KHBvc3NpYmxlRnVuY3Rpb25DYWxscywgJ3x8JyksXG4gICAgICAnKSdcbiAgICBdO1xuICAgIGxldCBmdW5jdGlvbkNhbGwgPSB0aGlzLnNvdXJjZS5mdW5jdGlvbkNhbGwoXG4gICAgICBmdW5jdGlvbkxvb2t1cENvZGUsXG4gICAgICAnY2FsbCcsXG4gICAgICBoZWxwZXIuY2FsbFBhcmFtc1xuICAgICk7XG4gICAgdGhpcy5wdXNoKGZ1bmN0aW9uQ2FsbCk7XG4gIH0sXG5cbiAgaXRlbXNTZXBhcmF0ZWRCeTogZnVuY3Rpb24oaXRlbXMsIHNlcGFyYXRvcikge1xuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICByZXN1bHQucHVzaChpdGVtc1swXSk7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2goc2VwYXJhdG9yLCBpdGVtc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIC8vIFtpbnZva2VLbm93bkhlbHBlcl1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogaGFzaCwgaW52ZXJzZSwgcHJvZ3JhbSwgcGFyYW1zLi4uLCAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiByZXN1bHQgb2YgaGVscGVyIGludm9jYXRpb25cbiAgLy9cbiAgLy8gVGhpcyBvcGVyYXRpb24gaXMgdXNlZCB3aGVuIHRoZSBoZWxwZXIgaXMga25vd24gdG8gZXhpc3QsXG4gIC8vIHNvIGEgYGhlbHBlck1pc3NpbmdgIGZhbGxiYWNrIGlzIG5vdCByZXF1aXJlZC5cbiAgaW52b2tlS25vd25IZWxwZXI6IGZ1bmN0aW9uKHBhcmFtU2l6ZSwgbmFtZSkge1xuICAgIGxldCBoZWxwZXIgPSB0aGlzLnNldHVwSGVscGVyKHBhcmFtU2l6ZSwgbmFtZSk7XG4gICAgdGhpcy5wdXNoKHRoaXMuc291cmNlLmZ1bmN0aW9uQ2FsbChoZWxwZXIubmFtZSwgJ2NhbGwnLCBoZWxwZXIuY2FsbFBhcmFtcykpO1xuICB9LFxuXG4gIC8vIFtpbnZva2VBbWJpZ3VvdXNdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IGhhc2gsIGludmVyc2UsIHByb2dyYW0sIHBhcmFtcy4uLiwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogcmVzdWx0IG9mIGRpc2FtYmlndWF0aW9uXG4gIC8vXG4gIC8vIFRoaXMgb3BlcmF0aW9uIGlzIHVzZWQgd2hlbiBhbiBleHByZXNzaW9uIGxpa2UgYHt7Zm9vfX1gXG4gIC8vIGlzIHByb3ZpZGVkLCBidXQgd2UgZG9uJ3Qga25vdyBhdCBjb21waWxlLXRpbWUgd2hldGhlciBpdFxuICAvLyBpcyBhIGhlbHBlciBvciBhIHBhdGguXG4gIC8vXG4gIC8vIFRoaXMgb3BlcmF0aW9uIGVtaXRzIG1vcmUgY29kZSB0aGFuIHRoZSBvdGhlciBvcHRpb25zLFxuICAvLyBhbmQgY2FuIGJlIGF2b2lkZWQgYnkgcGFzc2luZyB0aGUgYGtub3duSGVscGVyc2AgYW5kXG4gIC8vIGBrbm93bkhlbHBlcnNPbmx5YCBmbGFncyBhdCBjb21waWxlLXRpbWUuXG4gIGludm9rZUFtYmlndW91czogZnVuY3Rpb24obmFtZSwgaGVscGVyQ2FsbCkge1xuICAgIHRoaXMudXNlUmVnaXN0ZXIoJ2hlbHBlcicpO1xuXG4gICAgbGV0IG5vbkhlbHBlciA9IHRoaXMucG9wU3RhY2soKTtcblxuICAgIHRoaXMuZW1wdHlIYXNoKCk7XG4gICAgbGV0IGhlbHBlciA9IHRoaXMuc2V0dXBIZWxwZXIoMCwgbmFtZSwgaGVscGVyQ2FsbCk7XG5cbiAgICBsZXQgaGVscGVyTmFtZSA9ICh0aGlzLmxhc3RIZWxwZXIgPSB0aGlzLm5hbWVMb29rdXAoXG4gICAgICAnaGVscGVycycsXG4gICAgICBuYW1lLFxuICAgICAgJ2hlbHBlcidcbiAgICApKTtcblxuICAgIGxldCBsb29rdXAgPSBbJygnLCAnKGhlbHBlciA9ICcsIGhlbHBlck5hbWUsICcgfHwgJywgbm9uSGVscGVyLCAnKSddO1xuICAgIGlmICghdGhpcy5vcHRpb25zLnN0cmljdCkge1xuICAgICAgbG9va3VwWzBdID0gJyhoZWxwZXIgPSAnO1xuICAgICAgbG9va3VwLnB1c2goXG4gICAgICAgICcgIT0gbnVsbCA/IGhlbHBlciA6ICcsXG4gICAgICAgIHRoaXMuYWxpYXNhYmxlKCdjb250YWluZXIuaG9va3MuaGVscGVyTWlzc2luZycpXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMucHVzaChbXG4gICAgICAnKCcsXG4gICAgICBsb29rdXAsXG4gICAgICBoZWxwZXIucGFyYW1zSW5pdCA/IFsnKSwoJywgaGVscGVyLnBhcmFtc0luaXRdIDogW10sXG4gICAgICAnKSwnLFxuICAgICAgJyh0eXBlb2YgaGVscGVyID09PSAnLFxuICAgICAgdGhpcy5hbGlhc2FibGUoJ1wiZnVuY3Rpb25cIicpLFxuICAgICAgJyA/ICcsXG4gICAgICB0aGlzLnNvdXJjZS5mdW5jdGlvbkNhbGwoJ2hlbHBlcicsICdjYWxsJywgaGVscGVyLmNhbGxQYXJhbXMpLFxuICAgICAgJyA6IGhlbHBlcikpJ1xuICAgIF0pO1xuICB9LFxuXG4gIC8vIFtpbnZva2VQYXJ0aWFsXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiBjb250ZXh0LCAuLi5cbiAgLy8gT24gc3RhY2sgYWZ0ZXI6IHJlc3VsdCBvZiBwYXJ0aWFsIGludm9jYXRpb25cbiAgLy9cbiAgLy8gVGhpcyBvcGVyYXRpb24gcG9wcyBvZmYgYSBjb250ZXh0LCBpbnZva2VzIGEgcGFydGlhbCB3aXRoIHRoYXQgY29udGV4dCxcbiAgLy8gYW5kIHB1c2hlcyB0aGUgcmVzdWx0IG9mIHRoZSBpbnZvY2F0aW9uIGJhY2suXG4gIGludm9rZVBhcnRpYWw6IGZ1bmN0aW9uKGlzRHluYW1pYywgbmFtZSwgaW5kZW50KSB7XG4gICAgbGV0IHBhcmFtcyA9IFtdLFxuICAgICAgb3B0aW9ucyA9IHRoaXMuc2V0dXBQYXJhbXMobmFtZSwgMSwgcGFyYW1zKTtcblxuICAgIGlmIChpc0R5bmFtaWMpIHtcbiAgICAgIG5hbWUgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBkZWxldGUgb3B0aW9ucy5uYW1lO1xuICAgIH1cblxuICAgIGlmIChpbmRlbnQpIHtcbiAgICAgIG9wdGlvbnMuaW5kZW50ID0gSlNPTi5zdHJpbmdpZnkoaW5kZW50KTtcbiAgICB9XG4gICAgb3B0aW9ucy5oZWxwZXJzID0gJ2hlbHBlcnMnO1xuICAgIG9wdGlvbnMucGFydGlhbHMgPSAncGFydGlhbHMnO1xuICAgIG9wdGlvbnMuZGVjb3JhdG9ycyA9ICdjb250YWluZXIuZGVjb3JhdG9ycyc7XG5cbiAgICBpZiAoIWlzRHluYW1pYykge1xuICAgICAgcGFyYW1zLnVuc2hpZnQodGhpcy5uYW1lTG9va3VwKCdwYXJ0aWFscycsIG5hbWUsICdwYXJ0aWFsJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMudW5zaGlmdChuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbXBhdCkge1xuICAgICAgb3B0aW9ucy5kZXB0aHMgPSAnZGVwdGhzJztcbiAgICB9XG4gICAgb3B0aW9ucyA9IHRoaXMub2JqZWN0TGl0ZXJhbChvcHRpb25zKTtcbiAgICBwYXJhbXMucHVzaChvcHRpb25zKTtcblxuICAgIHRoaXMucHVzaCh0aGlzLnNvdXJjZS5mdW5jdGlvbkNhbGwoJ2NvbnRhaW5lci5pbnZva2VQYXJ0aWFsJywgJycsIHBhcmFtcykpO1xuICB9LFxuXG4gIC8vIFthc3NpZ25Ub0hhc2hdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IHZhbHVlLCAuLi4sIGhhc2gsIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLiwgaGFzaCwgLi4uXG4gIC8vXG4gIC8vIFBvcHMgYSB2YWx1ZSBvZmYgdGhlIHN0YWNrIGFuZCBhc3NpZ25zIGl0IHRvIHRoZSBjdXJyZW50IGhhc2hcbiAgYXNzaWduVG9IYXNoOiBmdW5jdGlvbihrZXkpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnBvcFN0YWNrKCksXG4gICAgICBjb250ZXh0LFxuICAgICAgdHlwZSxcbiAgICAgIGlkO1xuXG4gICAgaWYgKHRoaXMudHJhY2tJZHMpIHtcbiAgICAgIGlkID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdHJpbmdQYXJhbXMpIHtcbiAgICAgIHR5cGUgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBjb250ZXh0ID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cblxuICAgIGxldCBoYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBoYXNoLmNvbnRleHRzW2tleV0gPSBjb250ZXh0O1xuICAgIH1cbiAgICBpZiAodHlwZSkge1xuICAgICAgaGFzaC50eXBlc1trZXldID0gdHlwZTtcbiAgICB9XG4gICAgaWYgKGlkKSB7XG4gICAgICBoYXNoLmlkc1trZXldID0gaWQ7XG4gICAgfVxuICAgIGhhc2gudmFsdWVzW2tleV0gPSB2YWx1ZTtcbiAgfSxcblxuICBwdXNoSWQ6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGNoaWxkKSB7XG4gICAgaWYgKHR5cGUgPT09ICdCbG9ja1BhcmFtJykge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKFxuICAgICAgICAnYmxvY2tQYXJhbXNbJyArXG4gICAgICAgICAgbmFtZVswXSArXG4gICAgICAgICAgJ10ucGF0aFsnICtcbiAgICAgICAgICBuYW1lWzFdICtcbiAgICAgICAgICAnXScgK1xuICAgICAgICAgIChjaGlsZCA/ICcgKyAnICsgSlNPTi5zdHJpbmdpZnkoJy4nICsgY2hpbGQpIDogJycpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ1BhdGhFeHByZXNzaW9uJykge1xuICAgICAgdGhpcy5wdXNoU3RyaW5nKG5hbWUpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ1N1YkV4cHJlc3Npb24nKSB7XG4gICAgICB0aGlzLnB1c2hTdGFja0xpdGVyYWwoJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKCdudWxsJyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEhFTFBFUlNcblxuICBjb21waWxlcjogSmF2YVNjcmlwdENvbXBpbGVyLFxuXG4gIGNvbXBpbGVDaGlsZHJlbjogZnVuY3Rpb24oZW52aXJvbm1lbnQsIG9wdGlvbnMpIHtcbiAgICBsZXQgY2hpbGRyZW4gPSBlbnZpcm9ubWVudC5jaGlsZHJlbixcbiAgICAgIGNoaWxkLFxuICAgICAgY29tcGlsZXI7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGNvbXBpbGVyID0gbmV3IHRoaXMuY29tcGlsZXIoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuZXctY2FwXG5cbiAgICAgIGxldCBleGlzdGluZyA9IHRoaXMubWF0Y2hFeGlzdGluZ1Byb2dyYW0oY2hpbGQpO1xuXG4gICAgICBpZiAoZXhpc3RpbmcgPT0gbnVsbCkge1xuICAgICAgICAvLyBQbGFjZWhvbGRlciB0byBwcmV2ZW50IG5hbWUgY29uZmxpY3RzIGZvciBuZXN0ZWQgY2hpbGRyZW5cbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb250ZXh0LnByb2dyYW1zLnB1c2goJycpIC0gMTtcbiAgICAgICAgY2hpbGQuaW5kZXggPSBpbmRleDtcbiAgICAgICAgY2hpbGQubmFtZSA9ICdwcm9ncmFtJyArIGluZGV4O1xuICAgICAgICB0aGlzLmNvbnRleHQucHJvZ3JhbXNbaW5kZXhdID0gY29tcGlsZXIuY29tcGlsZShcbiAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgIHRoaXMuY29udGV4dCxcbiAgICAgICAgICAhdGhpcy5wcmVjb21waWxlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuY29udGV4dC5kZWNvcmF0b3JzW2luZGV4XSA9IGNvbXBpbGVyLmRlY29yYXRvcnM7XG4gICAgICAgIHRoaXMuY29udGV4dC5lbnZpcm9ubWVudHNbaW5kZXhdID0gY2hpbGQ7XG5cbiAgICAgICAgdGhpcy51c2VEZXB0aHMgPSB0aGlzLnVzZURlcHRocyB8fCBjb21waWxlci51c2VEZXB0aHM7XG4gICAgICAgIHRoaXMudXNlQmxvY2tQYXJhbXMgPSB0aGlzLnVzZUJsb2NrUGFyYW1zIHx8IGNvbXBpbGVyLnVzZUJsb2NrUGFyYW1zO1xuICAgICAgICBjaGlsZC51c2VEZXB0aHMgPSB0aGlzLnVzZURlcHRocztcbiAgICAgICAgY2hpbGQudXNlQmxvY2tQYXJhbXMgPSB0aGlzLnVzZUJsb2NrUGFyYW1zO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGQuaW5kZXggPSBleGlzdGluZy5pbmRleDtcbiAgICAgICAgY2hpbGQubmFtZSA9ICdwcm9ncmFtJyArIGV4aXN0aW5nLmluZGV4O1xuXG4gICAgICAgIHRoaXMudXNlRGVwdGhzID0gdGhpcy51c2VEZXB0aHMgfHwgZXhpc3RpbmcudXNlRGVwdGhzO1xuICAgICAgICB0aGlzLnVzZUJsb2NrUGFyYW1zID0gdGhpcy51c2VCbG9ja1BhcmFtcyB8fCBleGlzdGluZy51c2VCbG9ja1BhcmFtcztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG1hdGNoRXhpc3RpbmdQcm9ncmFtOiBmdW5jdGlvbihjaGlsZCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLmNvbnRleHQuZW52aXJvbm1lbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsZXQgZW52aXJvbm1lbnQgPSB0aGlzLmNvbnRleHQuZW52aXJvbm1lbnRzW2ldO1xuICAgICAgaWYgKGVudmlyb25tZW50ICYmIGVudmlyb25tZW50LmVxdWFscyhjaGlsZCkpIHtcbiAgICAgICAgcmV0dXJuIGVudmlyb25tZW50O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBwcm9ncmFtRXhwcmVzc2lvbjogZnVuY3Rpb24oZ3VpZCkge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuZW52aXJvbm1lbnQuY2hpbGRyZW5bZ3VpZF0sXG4gICAgICBwcm9ncmFtUGFyYW1zID0gW2NoaWxkLmluZGV4LCAnZGF0YScsIGNoaWxkLmJsb2NrUGFyYW1zXTtcblxuICAgIGlmICh0aGlzLnVzZUJsb2NrUGFyYW1zIHx8IHRoaXMudXNlRGVwdGhzKSB7XG4gICAgICBwcm9ncmFtUGFyYW1zLnB1c2goJ2Jsb2NrUGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZURlcHRocykge1xuICAgICAgcHJvZ3JhbVBhcmFtcy5wdXNoKCdkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJ2NvbnRhaW5lci5wcm9ncmFtKCcgKyBwcm9ncmFtUGFyYW1zLmpvaW4oJywgJykgKyAnKSc7XG4gIH0sXG5cbiAgdXNlUmVnaXN0ZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMucmVnaXN0ZXJzW25hbWVdKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyc1tuYW1lXSA9IHRydWU7XG4gICAgICB0aGlzLnJlZ2lzdGVycy5saXN0LnB1c2gobmFtZSk7XG4gICAgfVxuICB9LFxuXG4gIHB1c2g6IGZ1bmN0aW9uKGV4cHIpIHtcbiAgICBpZiAoIShleHByIGluc3RhbmNlb2YgTGl0ZXJhbCkpIHtcbiAgICAgIGV4cHIgPSB0aGlzLnNvdXJjZS53cmFwKGV4cHIpO1xuICAgIH1cblxuICAgIHRoaXMuaW5saW5lU3RhY2sucHVzaChleHByKTtcbiAgICByZXR1cm4gZXhwcjtcbiAgfSxcblxuICBwdXNoU3RhY2tMaXRlcmFsOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgdGhpcy5wdXNoKG5ldyBMaXRlcmFsKGl0ZW0pKTtcbiAgfSxcblxuICBwdXNoU291cmNlOiBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5wZW5kaW5nQ29udGVudCkge1xuICAgICAgdGhpcy5zb3VyY2UucHVzaChcbiAgICAgICAgdGhpcy5hcHBlbmRUb0J1ZmZlcihcbiAgICAgICAgICB0aGlzLnNvdXJjZS5xdW90ZWRTdHJpbmcodGhpcy5wZW5kaW5nQ29udGVudCksXG4gICAgICAgICAgdGhpcy5wZW5kaW5nTG9jYXRpb25cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRoaXMucGVuZGluZ0NvbnRlbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UucHVzaChzb3VyY2UpO1xuICAgIH1cbiAgfSxcblxuICByZXBsYWNlU3RhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgbGV0IHByZWZpeCA9IFsnKCddLFxuICAgICAgc3RhY2ssXG4gICAgICBjcmVhdGVkU3RhY2ssXG4gICAgICB1c2VkTGl0ZXJhbDtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKCF0aGlzLmlzSW5saW5lKCkpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ3JlcGxhY2VTdGFjayBvbiBub24taW5saW5lJyk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCB0byBtZXJnZSB0aGUgaW5saW5lIHN0YXRlbWVudCBpbnRvIHRoZSByZXBsYWNlbWVudCBzdGF0ZW1lbnQgdmlhICcsJ1xuICAgIGxldCB0b3AgPSB0aGlzLnBvcFN0YWNrKHRydWUpO1xuXG4gICAgaWYgKHRvcCBpbnN0YW5jZW9mIExpdGVyYWwpIHtcbiAgICAgIC8vIExpdGVyYWxzIGRvIG5vdCBuZWVkIHRvIGJlIGlubGluZWRcbiAgICAgIHN0YWNrID0gW3RvcC52YWx1ZV07XG4gICAgICBwcmVmaXggPSBbJygnLCBzdGFja107XG4gICAgICB1c2VkTGl0ZXJhbCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEdldCBvciBjcmVhdGUgdGhlIGN1cnJlbnQgc3RhY2sgbmFtZSBmb3IgdXNlIGJ5IHRoZSBpbmxpbmVcbiAgICAgIGNyZWF0ZWRTdGFjayA9IHRydWU7XG4gICAgICBsZXQgbmFtZSA9IHRoaXMuaW5jclN0YWNrKCk7XG5cbiAgICAgIHByZWZpeCA9IFsnKCgnLCB0aGlzLnB1c2gobmFtZSksICcgPSAnLCB0b3AsICcpJ107XG4gICAgICBzdGFjayA9IHRoaXMudG9wU3RhY2soKTtcbiAgICB9XG5cbiAgICBsZXQgaXRlbSA9IGNhbGxiYWNrLmNhbGwodGhpcywgc3RhY2spO1xuXG4gICAgaWYgKCF1c2VkTGl0ZXJhbCkge1xuICAgICAgdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cbiAgICBpZiAoY3JlYXRlZFN0YWNrKSB7XG4gICAgICB0aGlzLnN0YWNrU2xvdC0tO1xuICAgIH1cbiAgICB0aGlzLnB1c2gocHJlZml4LmNvbmNhdChpdGVtLCAnKScpKTtcbiAgfSxcblxuICBpbmNyU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhY2tTbG90Kys7XG4gICAgaWYgKHRoaXMuc3RhY2tTbG90ID4gdGhpcy5zdGFja1ZhcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnN0YWNrVmFycy5wdXNoKCdzdGFjaycgKyB0aGlzLnN0YWNrU2xvdCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRvcFN0YWNrTmFtZSgpO1xuICB9LFxuICB0b3BTdGFja05hbWU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnc3RhY2snICsgdGhpcy5zdGFja1Nsb3Q7XG4gIH0sXG4gIGZsdXNoSW5saW5lOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgaW5saW5lU3RhY2sgPSB0aGlzLmlubGluZVN0YWNrO1xuICAgIHRoaXMuaW5saW5lU3RhY2sgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gaW5saW5lU3RhY2subGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBlbnRyeSA9IGlubGluZVN0YWNrW2ldO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoZW50cnkgaW5zdGFuY2VvZiBMaXRlcmFsKSB7XG4gICAgICAgIHRoaXMuY29tcGlsZVN0YWNrLnB1c2goZW50cnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHN0YWNrID0gdGhpcy5pbmNyU3RhY2soKTtcbiAgICAgICAgdGhpcy5wdXNoU291cmNlKFtzdGFjaywgJyA9ICcsIGVudHJ5LCAnOyddKTtcbiAgICAgICAgdGhpcy5jb21waWxlU3RhY2sucHVzaChzdGFjayk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBpc0lubGluZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5saW5lU3RhY2subGVuZ3RoO1xuICB9LFxuXG4gIHBvcFN0YWNrOiBmdW5jdGlvbih3cmFwcGVkKSB7XG4gICAgbGV0IGlubGluZSA9IHRoaXMuaXNJbmxpbmUoKSxcbiAgICAgIGl0ZW0gPSAoaW5saW5lID8gdGhpcy5pbmxpbmVTdGFjayA6IHRoaXMuY29tcGlsZVN0YWNrKS5wb3AoKTtcblxuICAgIGlmICghd3JhcHBlZCAmJiBpdGVtIGluc3RhbmNlb2YgTGl0ZXJhbCkge1xuICAgICAgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghaW5saW5lKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmICghdGhpcy5zdGFja1Nsb3QpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdJbnZhbGlkIHN0YWNrIHBvcCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhY2tTbG90LS07XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG4gIH0sXG5cbiAgdG9wU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBzdGFjayA9IHRoaXMuaXNJbmxpbmUoKSA/IHRoaXMuaW5saW5lU3RhY2sgOiB0aGlzLmNvbXBpbGVTdGFjayxcbiAgICAgIGl0ZW0gPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgTGl0ZXJhbCkge1xuICAgICAgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbiAgfSxcblxuICBjb250ZXh0TmFtZTogZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmICh0aGlzLnVzZURlcHRocyAmJiBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gJ2RlcHRoc1snICsgY29udGV4dCArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdkZXB0aCcgKyBjb250ZXh0O1xuICAgIH1cbiAgfSxcblxuICBxdW90ZWRTdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5xdW90ZWRTdHJpbmcoc3RyKTtcbiAgfSxcblxuICBvYmplY3RMaXRlcmFsOiBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uub2JqZWN0TGl0ZXJhbChvYmopO1xuICB9LFxuXG4gIGFsaWFzYWJsZTogZnVuY3Rpb24obmFtZSkge1xuICAgIGxldCByZXQgPSB0aGlzLmFsaWFzZXNbbmFtZV07XG4gICAgaWYgKHJldCkge1xuICAgICAgcmV0LnJlZmVyZW5jZUNvdW50Kys7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHJldCA9IHRoaXMuYWxpYXNlc1tuYW1lXSA9IHRoaXMuc291cmNlLndyYXAobmFtZSk7XG4gICAgcmV0LmFsaWFzYWJsZSA9IHRydWU7XG4gICAgcmV0LnJlZmVyZW5jZUNvdW50ID0gMTtcblxuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgc2V0dXBIZWxwZXI6IGZ1bmN0aW9uKHBhcmFtU2l6ZSwgbmFtZSwgYmxvY2tIZWxwZXIpIHtcbiAgICBsZXQgcGFyYW1zID0gW10sXG4gICAgICBwYXJhbXNJbml0ID0gdGhpcy5zZXR1cEhlbHBlckFyZ3MobmFtZSwgcGFyYW1TaXplLCBwYXJhbXMsIGJsb2NrSGVscGVyKTtcbiAgICBsZXQgZm91bmRIZWxwZXIgPSB0aGlzLm5hbWVMb29rdXAoJ2hlbHBlcnMnLCBuYW1lLCAnaGVscGVyJyksXG4gICAgICBjYWxsQ29udGV4dCA9IHRoaXMuYWxpYXNhYmxlKFxuICAgICAgICBgJHt0aGlzLmNvbnRleHROYW1lKDApfSAhPSBudWxsID8gJHt0aGlzLmNvbnRleHROYW1lKFxuICAgICAgICAgIDBcbiAgICAgICAgKX0gOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KWBcbiAgICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICBwYXJhbXNJbml0OiBwYXJhbXNJbml0LFxuICAgICAgbmFtZTogZm91bmRIZWxwZXIsXG4gICAgICBjYWxsUGFyYW1zOiBbY2FsbENvbnRleHRdLmNvbmNhdChwYXJhbXMpXG4gICAgfTtcbiAgfSxcblxuICBzZXR1cFBhcmFtczogZnVuY3Rpb24oaGVscGVyLCBwYXJhbVNpemUsIHBhcmFtcykge1xuICAgIGxldCBvcHRpb25zID0ge30sXG4gICAgICBjb250ZXh0cyA9IFtdLFxuICAgICAgdHlwZXMgPSBbXSxcbiAgICAgIGlkcyA9IFtdLFxuICAgICAgb2JqZWN0QXJncyA9ICFwYXJhbXMsXG4gICAgICBwYXJhbTtcblxuICAgIGlmIChvYmplY3RBcmdzKSB7XG4gICAgICBwYXJhbXMgPSBbXTtcbiAgICB9XG5cbiAgICBvcHRpb25zLm5hbWUgPSB0aGlzLnF1b3RlZFN0cmluZyhoZWxwZXIpO1xuICAgIG9wdGlvbnMuaGFzaCA9IHRoaXMucG9wU3RhY2soKTtcblxuICAgIGlmICh0aGlzLnRyYWNrSWRzKSB7XG4gICAgICBvcHRpb25zLmhhc2hJZHMgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0cmluZ1BhcmFtcykge1xuICAgICAgb3B0aW9ucy5oYXNoVHlwZXMgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBvcHRpb25zLmhhc2hDb250ZXh0cyA9IHRoaXMucG9wU3RhY2soKTtcbiAgICB9XG5cbiAgICBsZXQgaW52ZXJzZSA9IHRoaXMucG9wU3RhY2soKSxcbiAgICAgIHByb2dyYW0gPSB0aGlzLnBvcFN0YWNrKCk7XG5cbiAgICAvLyBBdm9pZCBzZXR0aW5nIGZuIGFuZCBpbnZlcnNlIGlmIG5laXRoZXIgYXJlIHNldC4gVGhpcyBhbGxvd3NcbiAgICAvLyBoZWxwZXJzIHRvIGRvIGEgY2hlY2sgZm9yIGBpZiAob3B0aW9ucy5mbilgXG4gICAgaWYgKHByb2dyYW0gfHwgaW52ZXJzZSkge1xuICAgICAgb3B0aW9ucy5mbiA9IHByb2dyYW0gfHwgJ2NvbnRhaW5lci5ub29wJztcbiAgICAgIG9wdGlvbnMuaW52ZXJzZSA9IGludmVyc2UgfHwgJ2NvbnRhaW5lci5ub29wJztcbiAgICB9XG5cbiAgICAvLyBUaGUgcGFyYW1ldGVycyBnbyBvbiB0byB0aGUgc3RhY2sgaW4gb3JkZXIgKG1ha2luZyBzdXJlIHRoYXQgdGhleSBhcmUgZXZhbHVhdGVkIGluIG9yZGVyKVxuICAgIC8vIHNvIHdlIG5lZWQgdG8gcG9wIHRoZW0gb2ZmIHRoZSBzdGFjayBpbiByZXZlcnNlIG9yZGVyXG4gICAgbGV0IGkgPSBwYXJhbVNpemU7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgcGFyYW0gPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBwYXJhbXNbaV0gPSBwYXJhbTtcblxuICAgICAgaWYgKHRoaXMudHJhY2tJZHMpIHtcbiAgICAgICAgaWRzW2ldID0gdGhpcy5wb3BTdGFjaygpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICAgIHR5cGVzW2ldID0gdGhpcy5wb3BTdGFjaygpO1xuICAgICAgICBjb250ZXh0c1tpXSA9IHRoaXMucG9wU3RhY2soKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqZWN0QXJncykge1xuICAgICAgb3B0aW9ucy5hcmdzID0gdGhpcy5zb3VyY2UuZ2VuZXJhdGVBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRyYWNrSWRzKSB7XG4gICAgICBvcHRpb25zLmlkcyA9IHRoaXMuc291cmNlLmdlbmVyYXRlQXJyYXkoaWRzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICBvcHRpb25zLnR5cGVzID0gdGhpcy5zb3VyY2UuZ2VuZXJhdGVBcnJheSh0eXBlcyk7XG4gICAgICBvcHRpb25zLmNvbnRleHRzID0gdGhpcy5zb3VyY2UuZ2VuZXJhdGVBcnJheShjb250ZXh0cyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kYXRhKSB7XG4gICAgICBvcHRpb25zLmRhdGEgPSAnZGF0YSc7XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZUJsb2NrUGFyYW1zKSB7XG4gICAgICBvcHRpb25zLmJsb2NrUGFyYW1zID0gJ2Jsb2NrUGFyYW1zJztcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH0sXG5cbiAgc2V0dXBIZWxwZXJBcmdzOiBmdW5jdGlvbihoZWxwZXIsIHBhcmFtU2l6ZSwgcGFyYW1zLCB1c2VSZWdpc3Rlcikge1xuICAgIGxldCBvcHRpb25zID0gdGhpcy5zZXR1cFBhcmFtcyhoZWxwZXIsIHBhcmFtU2l6ZSwgcGFyYW1zKTtcbiAgICBvcHRpb25zLmxvYyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuc291cmNlLmN1cnJlbnRMb2NhdGlvbik7XG4gICAgb3B0aW9ucyA9IHRoaXMub2JqZWN0TGl0ZXJhbChvcHRpb25zKTtcbiAgICBpZiAodXNlUmVnaXN0ZXIpIHtcbiAgICAgIHRoaXMudXNlUmVnaXN0ZXIoJ29wdGlvbnMnKTtcbiAgICAgIHBhcmFtcy5wdXNoKCdvcHRpb25zJyk7XG4gICAgICByZXR1cm4gWydvcHRpb25zPScsIG9wdGlvbnNdO1xuICAgIH0gZWxzZSBpZiAocGFyYW1zKSB7XG4gICAgICBwYXJhbXMucHVzaChvcHRpb25zKTtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuICB9XG59O1xuXG4oZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHJlc2VydmVkV29yZHMgPSAoXG4gICAgJ2JyZWFrIGVsc2UgbmV3IHZhcicgK1xuICAgICcgY2FzZSBmaW5hbGx5IHJldHVybiB2b2lkJyArXG4gICAgJyBjYXRjaCBmb3Igc3dpdGNoIHdoaWxlJyArXG4gICAgJyBjb250aW51ZSBmdW5jdGlvbiB0aGlzIHdpdGgnICtcbiAgICAnIGRlZmF1bHQgaWYgdGhyb3cnICtcbiAgICAnIGRlbGV0ZSBpbiB0cnknICtcbiAgICAnIGRvIGluc3RhbmNlb2YgdHlwZW9mJyArXG4gICAgJyBhYnN0cmFjdCBlbnVtIGludCBzaG9ydCcgK1xuICAgICcgYm9vbGVhbiBleHBvcnQgaW50ZXJmYWNlIHN0YXRpYycgK1xuICAgICcgYnl0ZSBleHRlbmRzIGxvbmcgc3VwZXInICtcbiAgICAnIGNoYXIgZmluYWwgbmF0aXZlIHN5bmNocm9uaXplZCcgK1xuICAgICcgY2xhc3MgZmxvYXQgcGFja2FnZSB0aHJvd3MnICtcbiAgICAnIGNvbnN0IGdvdG8gcHJpdmF0ZSB0cmFuc2llbnQnICtcbiAgICAnIGRlYnVnZ2VyIGltcGxlbWVudHMgcHJvdGVjdGVkIHZvbGF0aWxlJyArXG4gICAgJyBkb3VibGUgaW1wb3J0IHB1YmxpYyBsZXQgeWllbGQgYXdhaXQnICtcbiAgICAnIG51bGwgdHJ1ZSBmYWxzZSdcbiAgKS5zcGxpdCgnICcpO1xuXG4gIGNvbnN0IGNvbXBpbGVyV29yZHMgPSAoSmF2YVNjcmlwdENvbXBpbGVyLlJFU0VSVkVEX1dPUkRTID0ge30pO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsID0gcmVzZXJ2ZWRXb3Jkcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBjb21waWxlcldvcmRzW3Jlc2VydmVkV29yZHNbaV1dID0gdHJ1ZTtcbiAgfVxufSkoKTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBNYXkgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG4gKi9cbkphdmFTY3JpcHRDb21waWxlci5pc1ZhbGlkSmF2YVNjcmlwdFZhcmlhYmxlTmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIChcbiAgICAhSmF2YVNjcmlwdENvbXBpbGVyLlJFU0VSVkVEX1dPUkRTW25hbWVdICYmXG4gICAgL15bYS16QS1aXyRdWzAtOWEtekEtWl8kXSokLy50ZXN0KG5hbWUpXG4gICk7XG59O1xuXG5mdW5jdGlvbiBzdHJpY3RMb29rdXAocmVxdWlyZVRlcm1pbmFsLCBjb21waWxlciwgcGFydHMsIHN0YXJ0UGFydEluZGV4LCB0eXBlKSB7XG4gIGxldCBzdGFjayA9IGNvbXBpbGVyLnBvcFN0YWNrKCksXG4gICAgbGVuID0gcGFydHMubGVuZ3RoO1xuICBpZiAocmVxdWlyZVRlcm1pbmFsKSB7XG4gICAgbGVuLS07XG4gIH1cblxuICBmb3IgKGxldCBpID0gc3RhcnRQYXJ0SW5kZXg7IGkgPCBsZW47IGkrKykge1xuICAgIHN0YWNrID0gY29tcGlsZXIubmFtZUxvb2t1cChzdGFjaywgcGFydHNbaV0sIHR5cGUpO1xuICB9XG5cbiAgaWYgKHJlcXVpcmVUZXJtaW5hbCkge1xuICAgIHJldHVybiBbXG4gICAgICBjb21waWxlci5hbGlhc2FibGUoJ2NvbnRhaW5lci5zdHJpY3QnKSxcbiAgICAgICcoJyxcbiAgICAgIHN0YWNrLFxuICAgICAgJywgJyxcbiAgICAgIGNvbXBpbGVyLnF1b3RlZFN0cmluZyhwYXJ0c1tsZW5dKSxcbiAgICAgICcsICcsXG4gICAgICBKU09OLnN0cmluZ2lmeShjb21waWxlci5zb3VyY2UuY3VycmVudExvY2F0aW9uKSxcbiAgICAgICcgKSdcbiAgICBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBKYXZhU2NyaXB0Q29tcGlsZXI7XG4iXX0=
