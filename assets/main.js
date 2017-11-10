document.addEventListener('DOMContentLoaded', function (event) {
  FeatureDetection.init();
  Caracteres.init();
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

var Caracteres = (function () {
  function Caracteres() {
    this.languageVoice = null;
  }

  Caracteres.prototype.onVoicesChanged = function () {
    for (var i = 0; i < Globals.languages.length; i++) {
      this.languageVoice = speechSynthesis.getVoices().find(function (voice) {
        return voice.lang.indexOf(Globals.languages[i]) !== -1;
      });

      if (this.languageVoice) {
        break;
      }
    }
  };

  Caracteres.prototype.speak = function (word) {
    var utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = this.languageVoice;
    utterance.lang = Globals.languages[0];
    speechSynthesis.speak(utterance);
  };

  Caracteres.prototype.onSpeakButtonClick = function () {
    window.Caracteres.speak(this.getAttribute('data-speak'));
  };

  Caracteres.prototype.addSpeakButtonClickListeners = function () {
    Array.prototype.slice.apply(document.querySelectorAll('[data-speak]'))
      .forEach(function (button) {
        button.addEventListener('click', window.Caracteres.onSpeakButtonClick);
      });
  };

  Caracteres.prototype.init = function () {
    if (FeatureDetection.hasSpeechSynthesis()) {
      speechSynthesis.onvoiceschanged = this.onVoicesChanged;
      this.addSpeakButtonClickListeners();
    }
  };

  return new Caracteres();
})();
