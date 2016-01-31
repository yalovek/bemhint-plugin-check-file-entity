var stylus = require('stylus');
var css = require('css');
var CssSelectorParser = require('css-selector-parser').CssSelectorParser;
var _ = require('lodash');
var bemNaming = require('bem-naming');
var Q = require('q');

exports.forEachTech = function (tech, entity) {
    var block = tech.entity.block;

    function getStyle (str) {
        var deferred = Q.defer();

        if (tech.name === 'styl')
            stylus(str).render(function (err, style) {
                if (err) deferred.reject(new Error(err));

                deferred.resolve(style);
            });
        else {
            deferred.resolve(str);
        }

        return deferred.promise;
    }

    function getAST (style) {
        return css.parse(style);
    }

    function getRules (ast) {
        return ast.stylesheet.rules;
    }

    function filterRules (rules) {
        return _.filter(rules, function (rule) {
            return rule.type === 'rule';
        });
    }

    function getSelectors (rules) {
        return _.map(rules, function (rule) {
            return rule.selectors;
        });
    }

    function reduceSelectors (selectors) {
        return _.reduce(selectors, function (selectors, selector) {
            _.forEach(selector, function (value) {
                selectors.push(value);
            });

            return selectors;
        }, []);
    }

    function parseSelectors (selectors) {
        return _.map(selectors, function (selector) {
            var parser = new CssSelectorParser();

            parser.registerSelectorPseudos('has');
            parser.registerNestingOperators('>', '+', '~');
            parser.registerAttrEqualityMods('^', '$', '*', '~');
            parser.enableSubstitutes();

            return {
                value: parser.parse(selector),
                selector: selector
            };
        });
    }

    function reduceClassNames (selectors) {
        return _.reduce(selectors, function (selectors, selector) {
            selectors.push({
                value: getClassNames(selector.value),
                selector: selector.selector
            });

            return selectors;
        }, []);
    }

    function getClassNames (selector) {
        var classNames = [];

        function goDeeper (selector) {
            if (selector.hasOwnProperty('rule')) {
                classNames.push(selector.rule.classNames);

                return goDeeper(selector.rule);
            }
        }

        goDeeper(selector);

        return _.reduce(classNames, function (classNames, className) {
            _.forEach(className, function (value) {
                classNames.push(value);
            });

            return classNames;
        }, []);
    }

    function getBlockNames (classNames) {
        return _.map(classNames, function (className) {
            return _.forEach(className, function (value) {
                return {
                    value: bemNaming.parse(value.value).block,
                    selector: value.selector
                };
            });
        });
    }

    function compareBlockNames (blockNames) {
        return _.map(blockNames, function (blockName) {
            return {
                value: !_.includes(blockName.value, block),
                selector: blockName.selector
            };
        });
    }

    function returnErrors (errors) {
        return _.forEach(errors, function (error) {
            error.value && entity.addError({
                msg: 'Name of entity is not correct',
                tech: tech.name,
                value: error.selector
            });
        });
    }

    return Q.fcall(function () {
            return tech.content;
        })
        .then(getStyle)
        .then(getAST)
        .then(getRules)
        .then(filterRules)
        .then(getSelectors)
        .then(reduceSelectors)
        .then(parseSelectors)
        .then(reduceClassNames)
        .then(getBlockNames)
        .then(compareBlockNames)
        .then(returnErrors);
};
