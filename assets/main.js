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
      Console.log('Unknown body id "' + document.body.id + '", no init function executed.');
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

var Synth = (function () {
  function Synth() {}

  Synth.prototype.speak = function (word, voice) {
    Console.log('Speaking "' + word + '" in ' + voice.lang + '.');

    var utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    speechSynthesis.speak(utterance);
  };

  return new Synth();
})();

var Caracteres = (function () {
  function Caracteres() {
    this.voice = null;
    this.showNerdStuffBtn = null;
  }

  Caracteres.prototype.init = function () {
    Console.log('Version: ' + Globals.version);

    if (FeatureDetection.hasSpeechSynthesis()) {
      speechSynthesis.onvoiceschanged = this.onVoicesChanged;
      this.addSpeakButtonClickListeners();
    }

    this.showNerdStuffBtn = document.getElementById('show-nerd-stuff-btn');
    this.showNerdStuffBtn.addEventListener('click', window.Chocolate.onShowNerdStuffClick.bind(this));
  };

  Caracteres.prototype.onVoicesChanged = function () {
    for (var i = 0; i < Globals.languages.length; i++) {
      window.Caracteres.voice = speechSynthesis.getVoices().find(function (voice) {
        return Globals.languages[i] === voice.lang.replace('_', '-');
      });

      if (window.Caracteres.voice) {
        Console.log('Selecting voice for language ' + window.Caracteres.voice.lang + '.');
        document.body.className += ' body--has-voice-available';
        break;
      }
    }

    if (!window.Caracteres.voice) {
      Console.log('No voice available for languages: ' + Globals.languages.join(',') + '.');
    }
  };

  Caracteres.prototype.speak = function (word) {
    window.Synth.speak(word, this.voice);
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

  Caracteres.prototype.onShowNerdStuffClick = function () {
    document.getElementById('console').classList.remove('console--hidden');
    this.showNerdStuffBtn.classList.add('btn--hidden');
  };

  return new Caracteres();
})();

var Chocolate = (function () {
  function Chocolate() {
    this.voices = {};
    this.showNerdStuffBtn = null;
  }

  Chocolate.prototype.init = function () {
    Console.log('Version: ' + Globals.version);

    if (FeatureDetection.hasSpeechSynthesis()) {
      speechSynthesis.onvoiceschanged = this.onVoicesChanged;
    }

    this.showNerdStuffBtn = document.getElementById('show-nerd-stuff-btn');
    this.showNerdStuffBtn.addEventListener('click', window.Chocolate.onShowNerdStuffClick.bind(this));
  };

  Chocolate.prototype.onVoicesChanged = function () {
    speechSynthesis.getVoices().forEach(function (voice) {
      var normalizedLanguageId = voice.lang.replace('-', '_');

      if (!window.Chocolate.voices[normalizedLanguageId]) {
        Console.log('Adding voice for language ' + normalizedLanguageId + '.');
        window.Chocolate.voices[normalizedLanguageId] = voice;
      }
    });

    window.Chocolate.addSpeakButtonClickListeners();
  };

  Chocolate.prototype.onSpeakButtonClick = function () {
    var languageId = this.getAttribute('data-language-id');
    window.Synth.speak(this.getAttribute('data-word'), window.Chocolate.voices[languageId]);
  };

  Chocolate.prototype.addSpeakButtonClickListeners = function () {
    Array.prototype.slice.apply(document.querySelectorAll('[data-word]'))
      .forEach(function (button) {
        var languageIds = button.getAttribute('data-language-ids').split(',');

        for (var i = 0; i < languageIds.length; i++) {
          if (window.Chocolate.voices[languageIds[i]] && !button.getAttribute('data-language-id')) {
            Console.log('Adding speak button click listener for ' + languageIds[i] + '.');

            button.text = window.Globals.actions.listen;
            button.href = 'javascript:void(0);';
            button.target = '';
            button.setAttribute('data-language-id', languageIds[i]);
            button.addEventListener('click', window.Chocolate.onSpeakButtonClick);

            break;
          }
        }
      });
  };

  Chocolate.prototype.onShowNerdStuffClick = function () {
    document.getElementById('console').classList.remove('console--hidden');
    this.showNerdStuffBtn.classList.add('btn--hidden');
  };

  return new Chocolate();
})();
