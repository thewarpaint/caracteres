var languageVoice;
var utter = function () {};

document.addEventListener('DOMContentLoaded', function (event) {
  if (window.speechSynthesis) {
    // Early version of feature detection.
    document.body.className += ' body--has-speech-synthesis';

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
