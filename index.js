var stylus = require('stylus');
var css = require('css');
var CssSelectorParser = require('css-selector-parser').CssSelectorParser;
var _ = require('lodash');
var bemNaming = require('bem-naming');

module.exports.forEntityTech = function (tech, techsConfig, entity) {
    var str = tech.content;
    var block = tech.entity.block;

    stylus(str).render(function (err, style) {
        if (err) throw err;

        var ast = css.parse(style);
        var rules = ast.stylesheet.rules;

        rules.forEach(function (rule) {
            var type = rule.type;

            if (type === 'rule') {
                var selectors = rule.selectors;

                selectors.forEach(function (selector) {
                    var parser = new CssSelectorParser();

                    parser.registerSelectorPseudos('has');
                    parser.registerNestingOperators('>', '+', '~');
                    parser.registerAttrEqualityMods('^', '$', '*', '~');
                    parser.enableSubstitutes();

                    var obj = parser.parse(selector);

                    if (obj.rule.hasOwnProperty('classNames')) {
                        var classNames = obj.rule.classNames;
                        var blockNames = _.map(classNames, function (className) {
                            return bemNaming.parse(className).block;
                        });
                        var isMatched = _.includes(blockNames, block);

                        if (tech.entity.hasOwnProperty('modVal')) {
                            var modVal = tech.entity.modVal;
                            var blockModVals = _.map(classNames, function (className) {
                                var bemObj = bemNaming.parse(className);

                                if (bemObj.hasOwnProperty('modVal')) {
                                    return bemObj.modVal;
                                }
                            });

                            !_.isBoolean(modVal) && (isMatched = _.includes(blockModVals, modVal));
                        }

                        if (!isMatched) {
                            entity.addError({
                                msg: 'Name of entity is not correct',
                                tech: tech.name,
                                value: selector
                            });
                        }
                    }
                });
            }
        });
    });
};
