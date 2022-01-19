/**
 * @title Color TOJ D1
 * @description Experiment on negation in TVA instructions (dual-colored version, copy of experiment 3 (paper: 1b) with well-defined assertion/negation sequence lengths (formerly only random lengths) and fewer SOAs).
 * - Includes improvements:
 * - new declaration of consent, conforming DSGVO
 * - note about color vision deficiency + linking to a self-check
 * - instructions to turn screen into landscape mode
 * - instructions about deactivating blue light filters
 * - instructions about deactivating blue light dark mode
 * - Instructions to turn on sound and sound test (still to be done)
 * - Experiment after a pause is continued by pressing the space bar, not by pressing any key
 * @version 1.1.0
 * @imageDir images/common,images/distrust
 * @audioDir audio/color-toj-negation,audio/feedback
 * @miscDir misc
 */

"use strict";

import "../styles/main.scss";


// jsPsych plugins
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-image-keyboard-response";
import "jspsych/plugins/jspsych-call-function";

import { TojPlugin } from "./plugins/jspsych-toj";
import tojNegationPlugin from "./plugins/jspsych-toj-negation-dual";
import "./plugins/jspsych-toj-negation-dual";

import delay from "delay";
import { sample } from "lodash";
import randomInt from "random-int";

import { TouchAdapter } from "./util/TouchAdapter";
import { Scaler } from "./util/Scaler";
import { createBarStimulusGrid } from "./util/barStimuli";
import { setAbsolutePosition } from "./util/positioning";
import { LabColor } from "./util/colors";
import { Quadrant } from "./util/Quadrant";
import { addIntroduction } from "./util/introduction";

const soaChoices = [-6, -3, -1, 0, 1, 3, 6].map((x) => (x * 16.6667).toFixed(3));
//const soaChoices = [-3, 0, 3].map((x) => (x * 16.6667).toFixed(3));
const soaChoicesTutorial = [-6, -3, 3, 6].map((x) => (x * 16.6667).toFixed(3));

const debugmode = false;

class TojTarget {
  /**
   * The target's color
   * @type {LabColor}
   */
  color;

  /**
   * The quadrant in which the target is displayed
   * @type {Quadrant}
   */
  quadrant;

  /**
   * Whether the target serves as a probe or a reference
   * @type boolean
   */
  isProbe;

  /**
   * Position of the target within the bar grid ([x, y])
   * @type number[]
   */
  gridPosition;
}

class ConditionGenerator {
  /**
   * The size ([x, y]) of the grid in one quadrant
   */
  static gridSize = [7, 4];

  /**
   * Color variation (in LAB degree) between targets of a pair
   */
  static alpha = 20;

  _previousOrientations = {};
  _previousPositions = {};

  generateOrientation(identifier = null) {
    let orientation;
    do {
      orientation = randomInt(0, 17) * 10;
    } while (identifier && orientation == this._previousOrientations[identifier]);
    if (identifier) {
      this._previousOrientations[identifier] = orientation;
    }
    return orientation;
  }

  static generateRandomPos(xRange, yRange) {
    return [randomInt(...xRange), randomInt(...yRange)];
  }

  generatePosition(identifier, xRange = [2, 5], yRange = [2, 5]) {
    let pos;
    do {
      pos = ConditionGenerator._generateRandomPos(xRange, yRange);
    } while (pos == this._previousPositions[identifier]);
    this._previousPositions[identifier] = pos;
    return pos;
  }

  static getRandomPrimaryColor() {
    return new LabColor(sample([0, 180]));
  }

  generateCondition(probeLeft) {
    const alpha = ConditionGenerator.alpha;
    const targetPairs = [];

    // Choose quadrants for targets
    const quadrantPairs = Quadrant.getRandomMixedSidePairs();

    // Generate information for two pairs of targets
    for (let pairIndex = 0; pairIndex < 2; pairIndex++) {
      // Create a target pair
      const primary = new TojTarget();
      const secondary = new TojTarget();

      primary.quadrant = quadrantPairs[pairIndex][0];
      secondary.quadrant = quadrantPairs[pairIndex][1];

      primary.color =
        pairIndex == 0
          ? ConditionGenerator.getRandomPrimaryColor()
          : targetPairs[0].primary.color.getRelativeColor(180);
      secondary.color = primary.color.getRandomRelativeColor([alpha, -alpha]);

      // Set isProbe
      primary.isProbe = probeLeft ? primary.quadrant.isLeft() : !primary.quadrant.isLeft();
      secondary.isProbe = !primary.isProbe;

      [primary, secondary].map((target) => {
        target.gridPosition = ConditionGenerator.generateRandomPos(
          target.quadrant.isLeft() ? [2, 5] : [1, 4],
          [1, 2]
        );
      });

      targetPairs[pairIndex] = { pairIndex, primary, secondary, fixationTime: randomInt(300, 500) };
    }

    return {
      targetPairs,
      rotation: this.generateOrientation(),
      distractorSOA: sample(soaChoices),
    };
  }
}

const conditionGenerator = new ConditionGenerator();

const leftKey = "q",
  rightKey = "p";

export function createTimeline() {

  const images = ["nexus2_10_tw_-3.00.bmp",
    "nexus2_10_tw_3.00.bmp",
    "nexus2_11_tw_-3.00.bmp",
    "nexus2_11_tw_3.00.bmp",
    "nexus2_12_tw_-3.00.bmp",
    "nexus2_12_tw_3.00.bmp",
    "nexus2_13_tw_-3.00.bmp",
    "nexus2_13_tw_3.00.bmp",
    "nexus2_14_tw_-3.00.bmp",
    "nexus2_14_tw_3.00.bmp",
    "nexus2_15_tw_-3.00.bmp",
    "nexus2_15_tw_3.00.bmp",
    "nexus2_16_tw_-3.00.bmp",
    "nexus2_16_tw_3.00.bmp",
    "nexus2_17_tw_-3.00.bmp",
    "nexus2_17_tw_3.00.bmp",
    "nexus2_18_tw_-3.00.bmp",
    "nexus2_18_tw_3.00.bmp",
    "nexus2_19_tw_-3.00.bmp",
    "nexus2_19_tw_3.00.bmp",
    "nexus2_1_tw_-3.00.bmp",
    "nexus2_1_tw_3.00.bmp",
    "nexus2_20_tw_-3.00.bmp",
    "nexus2_20_tw_3.00.bmp",
    "nexus2_21_tw_-3.00.bmp",
    "nexus2_21_tw_3.00.bmp",
    "nexus2_22_tw_-3.00.bmp",
    "nexus2_22_tw_3.00.bmp",
    "nexus2_23_tw_-3.00.bmp",
    "nexus2_23_tw_3.00.bmp",
    "nexus2_24_tw_-3.00.bmp",
    "nexus2_24_tw_3.00.bmp",
    "nexus2_25_tw_-3.00.bmp",
    "nexus2_25_tw_3.00.bmp",
    "nexus2_2_tw_-3.00.bmp",
    "nexus2_2_tw_3.00.bmp",
    "nexus2_3_tw_-3.00.bmp",
    "nexus2_3_tw_3.00.bmp",
    "nexus2_4_tw_-3.00.bmp",
    "nexus2_4_tw_3.00.bmp",
    "nexus2_5_tw_-3.00.bmp",
    "nexus2_5_tw_3.00.bmp",
    "nexus2_6_tw_-3.00.bmp",
    "nexus2_6_tw_3.00.bmp",
    "nexus2_7_tw_-3.00.bmp",
    "nexus2_7_tw_3.00.bmp",
    "nexus2_8_tw_-3.00.bmp",
    "nexus2_8_tw_3.00.bmp",
    "nexus2_9_tw_-3.00.bmp",
    "nexus2_9_tw_3.00.bmp"
    ]

  let timeline = [];

  jsPsych.pluginAPI.preloadImages(
    images.map((image) => `media/images/distrust/${image}`
    )
  );

  const touchAdapterSpace = new TouchAdapter(
    jsPsych.pluginAPI.convertKeyCharacterToKeyCode("space")
  );
  const bindSpaceTouchAdapterToWindow = async () => {
    await delay(500); // Prevent touch event from previous touch
    touchAdapterSpace.bindToElement(window);
  };
  const unbindSpaceTouchAdapterFromWindow = () => {
    touchAdapterSpace.unbindFromElement(window);
  };

  const globalProps = addIntroduction(timeline, {
    skip: true,
    experimentName: "Color TOJ-D",
    instructions: {
      en: `
You will see a grid of bars and a face in the middle. The face will disappear after a short moment and a point in the center will be visible.
Please try to focus at the faces and then at the point during the whole experiment.
Four of the bars are colored (red or green), where there are two pairs of similarly colored bars.
At the beginning of each trial, you will hear the instruction  "now red" or "now green".
This informs you which of the two pairs of bars is relevant for the respective trial; you can ignore the other pair then.
Then the face will disappear and afterwards, each of the colored bars will flash once.
Based on this, your task is to decide which of the two relevant bars has flashed first.

If it was the left one, press **Q** (or tap on the left half of your screen).
If it was the right one, press **P** (or tap on the right half of your screen).

Please try to be as exact as possible and avoid mistakes.
If it is not clear to you whether the left or the right bar flashed earlier, you may guess the answer.

The experiment will start with a tutorial in which a sound at the end of each trial will indicate whether your answer was correct or not.
Note that the playback of audio may be delayed for some of the first trials.
      `,
      de: `
Sie sehen gleich ein Muster aus Strichen und ein Gesicht in der Mitte. Das Gesicht verschwindet nach ein kurzem Moment und stattdessen ist mittig ein Punkt zu sehen. 
Konzentrieren Sie sich möglichst während des gesamten Experiments zunächst auf das Gesicht und dann auf den Punkt.
Vier der gezeigten Striche sind farbig (rot oder grün), wobei es jeweils zwei Paare von Strichen ähnlicher Farbe gibt.
Am Anfang jedes Durchgangs hören Sie die Anweisung "jetzt rot" oder "jetzt grün".
Diese sagt Ihnen, welches der beiden Paare für die weitere Aufgabe relevant ist; das jeweils andere Paar brauchen Sie nicht zu beachten.
Anschließend wird das Gesicht verschwinden und jeder der farbigen Striche kurz blinken.
Ihre Aufgabe ist es, zu entscheiden, welcher der beiden Striche des relevanten Paares zuerst geblinkt hat.

War es der linke, drücken Sie **Q** (oder tippen auf die linke Bildschirmhälfte).
War es der rechte, drücken Sie **P** (oder tippen auf die rechte Bildschirmhälfte).

Versuchen Sie, genau zu sein und keine Fehler zu machen.
Wenn Sie nicht wissen, welcher Strich zuerst blinkte, raten Sie.

Das Experiment beginnt mit einem Tutorial, bei dem Ihnen die Korrektheit jeder Antwort durch ein Geräusch rückgemeldet wird.
Die Audiowiedergabe kann bei den ersten Durchgängen leicht verzögert sein.
      `,
    },
  });

  const factors = {
    //isInstructionNegated: [true, false],
    probeLeft: [true, false],
    trust: ["trust","distrust"],
    soa: soaChoices,
  };
  const factorsTutorial = {
    //isInstructionNegated: [true, false],
    probeLeft: [true, false],
    trust: ["trust","distrust"],
    soa: soaChoicesTutorial,
  };  

  const repetitions = 2;

  let trialData = jsPsych.randomization.factorial(factors, repetitions);
  let trialData_tutorial =jsPsych.randomization.factorial(factorsTutorial, repetitions);

  const touchAdapterLeft = new TouchAdapter(
    jsPsych.pluginAPI.convertKeyCharacterToKeyCode(leftKey)
  );
  const touchAdapterRight = new TouchAdapter(
    jsPsych.pluginAPI.convertKeyCharacterToKeyCode(rightKey)
  );

  let scaler; // Will store the Scaler object for the TOJ plugin

  // Create TOJ plugin trial object
  const toj = (image) => ({
    type: "toj-negation-dual",
    modification_function: (element) => TojPlugin.flashElement(element, "toj-flash", 30),
    soa: jsPsych.timelineVariable("soa"),
    probe_key: () => (jsPsych.timelineVariable("probeLeft", true) ? leftKey : rightKey),
    reference_key: () => (jsPsych.timelineVariable("probeLeft", true) ? rightKey : leftKey),
    fixation_mark_html:  `<img class='toj-fixation-mark absolute-position' src='media/images/common/fixmark.png'></img>
    <img class='toj-fixation-mark absolute-position' src='media/images/distrust/${image}' id="fixFace" style='width:80px; opacity:1'></img>`, 
    instruction_negated: false,
    instruction_voice: "m",//() => sample(["m", "f"]),
    trust: jsPsych.timelineVariable("trust"),
    on_start: async (trial) => {
      setTimeout(() => {document.getElementById("fixFace").hidden=true}, 700)
      const probeLeft = jsPsych.timelineVariable("probeLeft", true);
      const cond = conditionGenerator.generateCondition(probeLeft);

      // Log probeLeft and condition
      trial.data = {
        probeLeft,
        condition: cond,
        rank: jsPsych.timelineVariable("rank", true),
        blockIndex: jsPsych.timelineVariable("blockIndex", true),
        trialIndexInThisTimeline: jsPsych.timelineVariable("trialIndex", true),
        trialIndexInThisBlock: jsPsych.timelineVariable("trialIndexInBlock", true),
      };

      trial.fixation_time = cond.targetPairs[0].fixationTime + 700;
      trial.distractor_fixation_time = cond.targetPairs[1].fixationTime + 700;
      trial.instruction_language = globalProps.instructionLanguage;

      const gridColor = "#777777";

      // Loop over targets, creating them and their grids in the corresponding quadrants
      for (const targetPair of cond.targetPairs) {
        [targetPair.primary, targetPair.secondary].map((target) => {
          const [gridElement, targetElement] = createBarStimulusGrid(
            ConditionGenerator.gridSize,
            target.gridPosition,
            target.color.toRgb(),
            gridColor,
            1,
            0.7,
            0.1,
            cond.rotation
          );
          tojNegationPlugin.appendElement(gridElement);
          (target.quadrant.isLeft() ? touchAdapterLeft : touchAdapterRight).bindToElement(
            gridElement
          );

          setAbsolutePosition(
            gridElement,
            (target.quadrant.isLeft() ? -1 : 1) * ConditionGenerator.gridSize[0] * 20,
            (target.quadrant.isTop() ? -1 : 1) * ConditionGenerator.gridSize[1] * 20
          );

          // Specify the elements for TOJ
          if (targetPair.pairIndex == 0) {
            // Task-relevant target pair
            if (target.isProbe) {
              trial.probe_element = targetElement;
            } else {
              trial.reference_element = targetElement;
            }
          } else {
            // Distracting target pair
            if (target.isProbe) {
              trial.distractor_probe_element = targetElement;
            } else {
              trial.distractor_reference_element = targetElement;
            }
          }
        });
      }

      // Set instruction color
      trial.instruction_filename =
        cond.targetPairs[trial.instruction_negated ? 1 : 0].primary.color.toName();

      // Set distractor SOA
      trial.distractor_soa = cond.distractorSOA;
    },
    on_load: async () => {
      // Fit to window size
      scaler = new Scaler(
        document.getElementById("jspsych-toj-container"),
        ConditionGenerator.gridSize[0] * 40 * 2,
        ConditionGenerator.gridSize[1] * 40 * 2,
        10
      );
    },
    on_finish: function (data) {
      scaler.destruct();
      touchAdapterLeft.unbindFromAll();
      touchAdapterRight.unbindFromAll();
      if (debugmode) {
        console.log(data);
      }
      if (!globalProps.isFirstParticipation) {
        if ((data["play_feedback"] === true) & (data["trialIndexInThisBlock"] >= 9)) {
          // do not continue after the 10th warm-up trial if participant is already familiar with the experiment
          jsPsych.endCurrentTimeline();
        }
      }
    },
  });

  const cursor_off = {
    type: "call-function",
    func: function () {
      document.body.style.cursor = "none";
    },
  };

  const cursor_on = {
    type: "call-function",
    func: function () {
      document.body.style.cursor = "auto";
    },
  };
  
  const trustImages = images.filter((image) => !image.includes("-3.0"))
  const distrustImages = images.filter((image) => image.includes("-3.0"))
  const lengthOfTutorial = 10

  // Creation of Tutorial
  for (let i = 0; i < lengthOfTutorial; i++) {
    let trial = trialData_tutorial[i];

    let randomImage = ""

    if(trial['trust'] === 'trust'){
      randomImage = trustImages[randomInt(0,trustImages.length-1)]
    } 
    else if(trial['trust'] === 'distrust'){
      randomImage = distrustImages[randomInt(0,distrustImages.length-1)]
    }

    const experimentTojTimeline = {
      timeline: [toj(randomImage)],
      timeline_variables: [trial],
      play_feedback: true,
    };

    timeline.push(
      cursor_off,
      experimentTojTimeline,
      cursor_on);
  }    
  timeline.push(
    {
      type: "html-keyboard-response",
      choices: [" "],
      stimulus: "<p>You finished the tutorial.</p><p>Press SPACE key or touch to continue.</p>",
      on_start: bindSpaceTouchAdapterToWindow,
      on_finish: unbindSpaceTouchAdapterFromWindow,
    }
  );

  const makeBlockFinishedScreenTrial = (block, blockCount) => ({
    type: "html-keyboard-response",
    choices: () => {
      if (block < blockCount) {
        return [" "];
      } else {
        return jsPsych.ALL_KEYS;
      }
    },
    stimulus: () => {
      if (block < blockCount) {
        return `<h1>Pause</h1><p>You finished block ${block} of ${blockCount}.<p/><p>Press SPACE key or touch to continue.</p>`;
      } else {
        return `<p>This part of the experiment is finished. Press any key or touch to submit the results!</p>`;
      }
    },
    on_start: bindSpaceTouchAdapterToWindow,
    on_finish: unbindSpaceTouchAdapterFromWindow, //für touch wichtig
  });

  let curBlockIndex = 0;

  timeline.push(cursor_off);

  // calculate how much trials are needed to run all combinations
  const singleRunTrialCount =  Object.getOwnPropertyNames(factors).map((factorName) => factors[factorName].length).reduce((acc,value) => (acc*value),1)
  const blockLengthLimit = singleRunTrialCount

  // shuffle array to get random order of trials
  trialData = jsPsych.randomization.repeat(trialData,1)

  for (let i = 0; i < trialData.length; i++) {
    let trial = trialData[i];

    let randomImage = ""

    if(trial['trust'] === 'trust'){
      randomImage = trustImages[randomInt(0,trustImages.length-1)]
    } 
    else if(trial['trust'] === 'distrust'){
      randomImage = distrustImages[randomInt(0,distrustImages.length-1)]
    }

    const experimentTojTimeline = {
      timeline: [toj(randomImage)],
      timeline_variables: [trial]
    };
    timeline.push(experimentTojTimeline);

    // if last trial in block
    if(i % blockLengthLimit === blockLengthLimit - 1){
      timeline.push(cursor_on);
      timeline.push(makeBlockFinishedScreenTrial(curBlockIndex + 1, Math.ceil(singleRunTrialCount*repetitions/blockLengthLimit)));
      curBlockIndex ++
      timeline.push(cursor_off);
    }
  }
  timeline.push(cursor_on);

  // Disable fullscreen
  timeline.push({
    type: "fullscreen",
    fullscreen_mode: false,
  });
 
  return timeline;
}
