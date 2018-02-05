document.addEventListener('DOMContentLoaded', function (event) {
  FeatureDetection.init();

  switch (document.body.id) {
    case 'caracteres':
      Caracteres.init();
      break;

    case 'chocolate':
      Chocolate.init();
      break;

    default:
      console.warn('Unknown body id "' + document.body.id + '", no init function executed.');
      break;
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

var Chocolate = (function () {
  function Chocolate() {
    this.voices = {};
  }

  Chocolate.prototype.init = function () {
    if (FeatureDetection.hasSpeechSynthesis()) {
      speechSynthesis.onvoiceschanged = this.onVoicesChanged;
    }
  };

  Chocolate.prototype.onVoicesChanged = function () {
    speechSynthesis.getVoices().forEach(function (voice) {
      if (!window.Chocolate.voices[voice.lang]) {
        window.Chocolate.voices[voice.lang] = voice;
      }
    });

    window.Chocolate.addSpeakButtonClickListeners();
  };

  Chocolate.prototype.onSpeakButtonClick = function () {
    window.Chocolate.speak(this.getAttribute('data-word'), this.getAttribute('data-language-id'));
  };

  Chocolate.prototype.addSpeakButtonClickListeners = function () {
    Array.prototype.slice.apply(document.querySelectorAll('[data-word]'))
      .forEach(function (button) {
        var languageIds = button.getAttribute('data-language-ids').split(',');

        for (var i = 0; i < languageIds.length; i++) {
          if (window.Chocolate.voices[languageIds[i]] && !button.getAttribute('data-language-id')) {
            button.href = 'javascript:void(0);';
            button.target = '';
            button.setAttribute('data-language-id', languageIds[i]);
            button.addEventListener('click', window.Chocolate.onSpeakButtonClick);

            break;
          }
        }
      });
  };

  Chocolate.prototype.speak = function (word, language) {
    var utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = window.Chocolate.voices[language];
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  };

  return new Chocolate();
})();

var Console = (function () {
  function Console() {
    this.element = document.querySelector('.console');
  }

  Console.prototype.log = function log(string) {
    console.log(string);
    this.element.innerHTML += '\n⇒ ' + string;
  };

  return new Console();
})();
