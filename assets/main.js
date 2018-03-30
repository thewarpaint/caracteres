document.addEventListener('DOMContentLoaded', function (event) {
  FeatureDetection.init();
  DebugMode.init();

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
  function Synth() {
    this.voices = {};
    this.onVoicesChangedCallback = function () {}; //noop
  }

  Synth.prototype.init = function (onVoicesChangedCallback) {
    if (FeatureDetection.hasSpeechSynthesis()) {
      speechSynthesis.onvoiceschanged = this.onVoicesChanged;

      if (typeof onVoicesChangedCallback === 'function') {
        this.onVoicesChangedCallback = onVoicesChangedCallback;
      }
    }
  };

  Synth.prototype.onVoicesChanged = function () {
    speechSynthesis.getVoices().forEach(function (voice) {
      var normalizedLanguageId = voice.lang.replace(/_/g, '-');

      if (!window.Synth.voices[normalizedLanguageId]) {
        Console.log('Adding voice for language ' + normalizedLanguageId + '.');
        window.Synth.voices[normalizedLanguageId] = voice;
      }
    });

    window.Synth.onVoicesChangedCallback();
  };

  Synth.prototype.speakInLanguageIds = function (word, languageIds) {
    for (var i = 0; i < languageIds.length; i++) {
      if (window.Synth.voices[languageIds[i]]) {
        this.speak(word, this.voices[languageIds[i]]);

        return;
      }
    }

    Console.log('No voice available for languages: ' + languageIds.join(',') + '.');
  };

  Synth.prototype.speakInLanguageId = function (word, languageId) {
    if (!this.voices[languageId]) {
      Console.log('No voice available for language: ' + languageId + '.');
      return;
    }

    this.speak(word, this.voices[languageId]);
  };

  Synth.prototype.speak = function (word, voice) {
    Console.log('Speaking "' + word + '" in ' + voice.lang + '.');

    var utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    speechSynthesis.speak(utterance);
  };

  return new Synth();
})();

var DebugMode = (function () {
  function DebugMode() {}

  DebugMode.prototype.init = function () {
    // Primitive query string parameter check, but enough for our needs.
    if (FeatureDetection.hasLocalStorage()) {
      if (window.location.search.indexOf('debugMode=true') !== -1) {
        localStorage.setItem('debugMode', 'true');
      } else if (window.location.search.indexOf('debugMode=false') !== -1) {
        localStorage.removeItem('debugMode');
      }
    }
  }

  return new DebugMode();
})();

var Caracteres = (function () {
  function Caracteres() {
    this.mainLanguage = null;
    this.hasMainLanguageVoice = false;
    this.showNerdStuffBtn = null;
  }

  Caracteres.prototype.init = function () {
    Console.log('Version: ' + Globals.version);

    Synth.init(this.onVoicesChanged);

    if (FeatureDetection.hasSpeechSynthesis()) {
      this.addSpeakButtonClickListeners();
    }

    this.showNerdStuffBtn = document.getElementById('show-nerd-stuff-btn');
    this.showNerdStuffBtn.addEventListener('click', window.Chocolate.onShowNerdStuffClick.bind(this));
  };

  Caracteres.prototype.onVoicesChanged = function () {
    for (var i = 0; i < Globals.languages.length; i++) {
      window.Caracteres.hasMainLanguageVoice =
        typeof window.Synth.voices[Globals.languages[i]] !== 'undefined';

      if (window.Caracteres.hasMainLanguageVoice) {
        Console.log('Selecting voice for language ' + Globals.languages[i] + '.');
        window.Caracteres.mainLanguage = Globals.languages[i];
        document.body.classList.add('body--has-voice-available');

        break;
      }
    }

    if (!window.Caracteres.hasMainLanguageVoice) {
      Console.log('No voice available for languages: ' + Globals.languages.join(',') + '.');
    }
  };

  Caracteres.prototype.speak = function (word) {
    window.Synth.speakInLanguageId(word, window.Caracteres.mainLanguage);
  };

  Caracteres.prototype.onSpeakButtonClick = function () {
    window.Caracteres.speak(this.getAttribute('data-speak'));
  };

  Caracteres.prototype.onListenableLinkClick = function () {
    if (this.getAttribute('data-lang')) {
      var languageIds = this.getAttribute('data-lang').split(',');
      window.Synth.speakInLanguageIds(this.innerText, languageIds);
    } else {
      window.Caracteres.speak(this.innerText);
    }
  };

  Caracteres.prototype.addSpeakButtonClickListeners = function () {
    Array.prototype.slice.apply(document.querySelectorAll('[data-speak]'))
      .forEach(function (button) {
        button.addEventListener('click', window.Caracteres.onSpeakButtonClick);
      });

    Array.prototype.slice.apply(document.querySelectorAll('.link--listenable'))
      .forEach(function ($link) {
        $link.addEventListener('click', window.Caracteres.onListenableLinkClick);
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
    this.showNerdStuffBtn = null;
  }

  Chocolate.prototype.init = function () {
    Console.log('Version: ' + Globals.version);

    Synth.init(this.onVoicesChanged);

    this.showNerdStuffBtn = document.getElementById('show-nerd-stuff-btn');
    this.showNerdStuffBtn.addEventListener('click', window.Chocolate.onShowNerdStuffClick.bind(this));
  };

  Chocolate.prototype.onVoicesChanged = function () {
    window.Chocolate.addSpeakButtonClickListeners();
  };

  Chocolate.prototype.onSpeakButtonClick = function () {
    var languageId = this.getAttribute('data-language-id');
    window.Synth.speakInLanguageId(this.getAttribute('data-word'), languageId);
  };

  Chocolate.prototype.addSpeakButtonClickListeners = function () {
    Array.prototype.slice.apply(document.querySelectorAll('[data-word]'))
      .forEach(function (button) {
        var languageIds = button.getAttribute('data-language-ids').split(',');

        for (var i = 0; i < languageIds.length; i++) {
          if (window.Synth.voices[languageIds[i]] && !button.getAttribute('data-language-id')) {
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
