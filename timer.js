/* ========================================
   Exam Timer Module
   ======================================== */

const Timer = (() => {

  let intervalId = null;
  let remainingTime = 0;

  /* ----------------------------
     Start Timer
  ----------------------------- */

  function start(seconds, onTick, onComplete) {

    stop();

    remainingTime = seconds;

    onTick(remainingTime);

    intervalId = setInterval(() => {

      remainingTime--;

      if (remainingTime <= 0) {

        stop();

        if (onTick) onTick(0);
        if (onComplete) onComplete();

      } else {

        if (onTick) onTick(remainingTime);

      }

    }, 1000);

    return intervalId;
  }

  /* ----------------------------
     Stop Timer
  ----------------------------- */

  function stop() {

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

  }

  /* ----------------------------
     Get Remaining Time
  ----------------------------- */

  function getRemaining() {
    return remainingTime;
  }

  /* ----------------------------
     Public API
  ----------------------------- */

  return {
    start,
    stop,
    getRemaining
  };

})();

window.Timer = Timer;
