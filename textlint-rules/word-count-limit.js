/**
 * Custom textlint rule for word count limits
 * Issues a warning at 200+ words and an error at 400+ words
 */

function countWords(text) {
  // Remove extra whitespace and split by whitespace
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

module.exports = function(context) {
  const { Syntax, RuleError, report, getSource } = context;
  
  return {
    [Syntax.Document](node) {
      const text = getSource(node);
      const wordCount = countWords(text);
      
      if (wordCount >= 400) {
        report(node, new RuleError(`Document has ${wordCount} words, which exceeds the limit of 400 words`));
      } else if (wordCount >= 200) {
        report(node, new RuleError(`Document has ${wordCount} words, which exceeds the recommended limit of 200 words`));
      }
    }
  };
};
