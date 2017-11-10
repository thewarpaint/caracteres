var languageVoice;
var utter = function () {};

document.addEventListener('DOMContentLoaded', function (event) {
  FeatureDetection.init();

  if (FeatureDetection.hasSpeechSynthesis()) {
    speechSynthesis.onvoiceschanged = function () {
      for (var i = 0; i < languages.length; i++) {
        languageVoice = speechSynthesis.getVoices().find(function (voice) {
          return voice.lang.indexOf(languages[i]) !== -1;
        });

        if (languageVoice) {
          break;
        }
      }
    };

    utter = function (word) {
      var utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = languageVoice;
      utterance.lang = languages[0];
      speechSynthesis.speak(utterance);
    };
  }
});

var FeatureDetection = (function () {
  function FeatureDetection() {}

  FeatureDetection.prototype.hasSpeechSynthesis = function () {
    return 'speechSynthesis' in window;
  };

  FeatureDetection.prototype.init = function () {
    var features = [
      { detector: this.hasSpeechSynthesis, aClass: 'body--has-speech-synthesis' }
    ];

    var bodyClasses = [];

    for(var i = 0; i < features.length; i++) {
      if (features[i].detector()) {
        bodyClasses.push(features[i].aClass);
      }
    }

    document.body.className += ' ' + bodyClasses.join(' ');
  };

  return new FeatureDetection();
})();
