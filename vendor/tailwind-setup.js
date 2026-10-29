(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/tailwindcss/lib/util/createPlugin.js
  var require_createPlugin = __commonJS({
    "node_modules/tailwindcss/lib/util/createPlugin.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "default", {
        enumerable: true,
        get: function() {
          return _default;
        }
      });
      function createPlugin(plugin3, config) {
        return {
          handler: plugin3,
          config
        };
      }
      createPlugin.withOptions = function(pluginFunction, configFunction = () => ({})) {
        const optionsFunction = function(options) {
          return {
            __options: options,
            handler: pluginFunction(options),
            config: configFunction(options)
          };
        };
        optionsFunction.__isOptionsFunction = true;
        optionsFunction.__pluginFunction = pluginFunction;
        optionsFunction.__configFunction = configFunction;
        return optionsFunction;
      };
      var _default = createPlugin;
    }
  });

  // node_modules/tailwindcss/lib/public/create-plugin.js
  var require_create_plugin = __commonJS({
    "node_modules/tailwindcss/lib/public/create-plugin.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "default", {
        enumerable: true,
        get: function() {
          return _default;
        }
      });
      var _createPlugin = /* @__PURE__ */ _interop_require_default(require_createPlugin());
      function _interop_require_default(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      var _default = _createPlugin.default;
    }
  });

  // node_modules/tailwindcss/plugin.js
  var require_plugin = __commonJS({
    "node_modules/tailwindcss/plugin.js"(exports, module) {
      var createPlugin = require_create_plugin();
      module.exports = (createPlugin.__esModule ? createPlugin : { default: createPlugin }).default;
    }
  });

  // node_modules/tailwindcss/lib/util/cloneDeep.js
  var require_cloneDeep = __commonJS({
    "node_modules/tailwindcss/lib/util/cloneDeep.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "cloneDeep", {
        enumerable: true,
        get: function() {
          return cloneDeep;
        }
      });
      function cloneDeep(value) {
        if (Array.isArray(value)) {
          return value.map((child) => cloneDeep(child));
        }
        if (typeof value === "object" && value !== null) {
          return Object.fromEntries(Object.entries(value).map(([k, v]) => [
            k,
            cloneDeep(v)
          ]));
        }
        return value;
      }
    }
  });

  // node_modules/tailwindcss/stubs/config.full.js
  var require_config_full = __commonJS({
    "node_modules/tailwindcss/stubs/config.full.js"(exports, module) {
      module.exports = {
        content: [],
        presets: [],
        darkMode: "media",
        // or 'class'
        theme: {
          accentColor: ({ theme: theme2 }) => ({
            ...theme2("colors"),
            auto: "auto"
          }),
          animation: {
            none: "none",
            spin: "spin 1s linear infinite",
            ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
            pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            bounce: "bounce 1s infinite"
          },
          aria: {
            busy: 'busy="true"',
            checked: 'checked="true"',
            disabled: 'disabled="true"',
            expanded: 'expanded="true"',
            hidden: 'hidden="true"',
            pressed: 'pressed="true"',
            readonly: 'readonly="true"',
            required: 'required="true"',
            selected: 'selected="true"'
          },
          aspectRatio: {
            auto: "auto",
            square: "1 / 1",
            video: "16 / 9"
          },
          backdropBlur: ({ theme: theme2 }) => theme2("blur"),
          backdropBrightness: ({ theme: theme2 }) => theme2("brightness"),
          backdropContrast: ({ theme: theme2 }) => theme2("contrast"),
          backdropGrayscale: ({ theme: theme2 }) => theme2("grayscale"),
          backdropHueRotate: ({ theme: theme2 }) => theme2("hueRotate"),
          backdropInvert: ({ theme: theme2 }) => theme2("invert"),
          backdropOpacity: ({ theme: theme2 }) => theme2("opacity"),
          backdropSaturate: ({ theme: theme2 }) => theme2("saturate"),
          backdropSepia: ({ theme: theme2 }) => theme2("sepia"),
          backgroundColor: ({ theme: theme2 }) => theme2("colors"),
          backgroundImage: {
            none: "none",
            "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))",
            "gradient-to-tr": "linear-gradient(to top right, var(--tw-gradient-stops))",
            "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
            "gradient-to-br": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
            "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))",
            "gradient-to-bl": "linear-gradient(to bottom left, var(--tw-gradient-stops))",
            "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))",
            "gradient-to-tl": "linear-gradient(to top left, var(--tw-gradient-stops))"
          },
          backgroundOpacity: ({ theme: theme2 }) => theme2("opacity"),
          backgroundPosition: {
            bottom: "bottom",
            center: "center",
            left: "left",
            "left-bottom": "left bottom",
            "left-top": "left top",
            right: "right",
            "right-bottom": "right bottom",
            "right-top": "right top",
            top: "top"
          },
          backgroundSize: {
            auto: "auto",
            cover: "cover",
            contain: "contain"
          },
          blur: {
            0: "0",
            none: "",
            sm: "4px",
            DEFAULT: "8px",
            md: "12px",
            lg: "16px",
            xl: "24px",
            "2xl": "40px",
            "3xl": "64px"
          },
          borderColor: ({ theme: theme2 }) => ({
            ...theme2("colors"),
            DEFAULT: theme2("colors.gray.200", "currentColor")
          }),
          borderOpacity: ({ theme: theme2 }) => theme2("opacity"),
          borderRadius: {
            none: "0px",
            sm: "0.125rem",
            DEFAULT: "0.25rem",
            md: "0.375rem",
            lg: "0.5rem",
            xl: "0.75rem",
            "2xl": "1rem",
            "3xl": "1.5rem",
            full: "9999px"
          },
          borderSpacing: ({ theme: theme2 }) => ({
            ...theme2("spacing")
          }),
          borderWidth: {
            DEFAULT: "1px",
            0: "0px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          boxShadow: {
            sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
            md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
            none: "none"
          },
          boxShadowColor: ({ theme: theme2 }) => theme2("colors"),
          brightness: {
            0: "0",
            50: ".5",
            75: ".75",
            90: ".9",
            95: ".95",
            100: "1",
            105: "1.05",
            110: "1.1",
            125: "1.25",
            150: "1.5",
            200: "2"
          },
          caretColor: ({ theme: theme2 }) => theme2("colors"),
          colors: ({ colors }) => ({
            inherit: colors.inherit,
            current: colors.current,
            transparent: colors.transparent,
            black: colors.black,
            white: colors.white,
            slate: colors.slate,
            gray: colors.gray,
            zinc: colors.zinc,
            neutral: colors.neutral,
            stone: colors.stone,
            red: colors.red,
            orange: colors.orange,
            amber: colors.amber,
            yellow: colors.yellow,
            lime: colors.lime,
            green: colors.green,
            emerald: colors.emerald,
            teal: colors.teal,
            cyan: colors.cyan,
            sky: colors.sky,
            blue: colors.blue,
            indigo: colors.indigo,
            violet: colors.violet,
            purple: colors.purple,
            fuchsia: colors.fuchsia,
            pink: colors.pink,
            rose: colors.rose
          }),
          columns: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            "3xs": "16rem",
            "2xs": "18rem",
            xs: "20rem",
            sm: "24rem",
            md: "28rem",
            lg: "32rem",
            xl: "36rem",
            "2xl": "42rem",
            "3xl": "48rem",
            "4xl": "56rem",
            "5xl": "64rem",
            "6xl": "72rem",
            "7xl": "80rem"
          },
          container: {},
          content: {
            none: "none"
          },
          contrast: {
            0: "0",
            50: ".5",
            75: ".75",
            100: "1",
            125: "1.25",
            150: "1.5",
            200: "2"
          },
          cursor: {
            auto: "auto",
            default: "default",
            pointer: "pointer",
            wait: "wait",
            text: "text",
            move: "move",
            help: "help",
            "not-allowed": "not-allowed",
            none: "none",
            "context-menu": "context-menu",
            progress: "progress",
            cell: "cell",
            crosshair: "crosshair",
            "vertical-text": "vertical-text",
            alias: "alias",
            copy: "copy",
            "no-drop": "no-drop",
            grab: "grab",
            grabbing: "grabbing",
            "all-scroll": "all-scroll",
            "col-resize": "col-resize",
            "row-resize": "row-resize",
            "n-resize": "n-resize",
            "e-resize": "e-resize",
            "s-resize": "s-resize",
            "w-resize": "w-resize",
            "ne-resize": "ne-resize",
            "nw-resize": "nw-resize",
            "se-resize": "se-resize",
            "sw-resize": "sw-resize",
            "ew-resize": "ew-resize",
            "ns-resize": "ns-resize",
            "nesw-resize": "nesw-resize",
            "nwse-resize": "nwse-resize",
            "zoom-in": "zoom-in",
            "zoom-out": "zoom-out"
          },
          divideColor: ({ theme: theme2 }) => theme2("borderColor"),
          divideOpacity: ({ theme: theme2 }) => theme2("borderOpacity"),
          divideWidth: ({ theme: theme2 }) => theme2("borderWidth"),
          dropShadow: {
            sm: "0 1px 1px rgb(0 0 0 / 0.05)",
            DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.1)", "0 1px 1px rgb(0 0 0 / 0.06)"],
            md: ["0 4px 3px rgb(0 0 0 / 0.07)", "0 2px 2px rgb(0 0 0 / 0.06)"],
            lg: ["0 10px 8px rgb(0 0 0 / 0.04)", "0 4px 3px rgb(0 0 0 / 0.1)"],
            xl: ["0 20px 13px rgb(0 0 0 / 0.03)", "0 8px 5px rgb(0 0 0 / 0.08)"],
            "2xl": "0 25px 25px rgb(0 0 0 / 0.15)",
            none: "0 0 #0000"
          },
          fill: ({ theme: theme2 }) => ({
            none: "none",
            ...theme2("colors")
          }),
          flex: {
            1: "1 1 0%",
            auto: "1 1 auto",
            initial: "0 1 auto",
            none: "none"
          },
          flexBasis: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            "1/5": "20%",
            "2/5": "40%",
            "3/5": "60%",
            "4/5": "80%",
            "1/6": "16.666667%",
            "2/6": "33.333333%",
            "3/6": "50%",
            "4/6": "66.666667%",
            "5/6": "83.333333%",
            "1/12": "8.333333%",
            "2/12": "16.666667%",
            "3/12": "25%",
            "4/12": "33.333333%",
            "5/12": "41.666667%",
            "6/12": "50%",
            "7/12": "58.333333%",
            "8/12": "66.666667%",
            "9/12": "75%",
            "10/12": "83.333333%",
            "11/12": "91.666667%",
            full: "100%"
          }),
          flexGrow: {
            0: "0",
            DEFAULT: "1"
          },
          flexShrink: {
            0: "0",
            DEFAULT: "1"
          },
          fontFamily: {
            sans: [
              "ui-sans-serif",
              "system-ui",
              "sans-serif",
              '"Apple Color Emoji"',
              '"Segoe UI Emoji"',
              '"Segoe UI Symbol"',
              '"Noto Color Emoji"'
            ],
            serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
            mono: [
              "ui-monospace",
              "SFMono-Regular",
              "Menlo",
              "Monaco",
              "Consolas",
              '"Liberation Mono"',
              '"Courier New"',
              "monospace"
            ]
          },
          fontSize: {
            xs: ["0.75rem", { lineHeight: "1rem" }],
            sm: ["0.875rem", { lineHeight: "1.25rem" }],
            base: ["1rem", { lineHeight: "1.5rem" }],
            lg: ["1.125rem", { lineHeight: "1.75rem" }],
            xl: ["1.25rem", { lineHeight: "1.75rem" }],
            "2xl": ["1.5rem", { lineHeight: "2rem" }],
            "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
            "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
            "5xl": ["3rem", { lineHeight: "1" }],
            "6xl": ["3.75rem", { lineHeight: "1" }],
            "7xl": ["4.5rem", { lineHeight: "1" }],
            "8xl": ["6rem", { lineHeight: "1" }],
            "9xl": ["8rem", { lineHeight: "1" }]
          },
          fontWeight: {
            thin: "100",
            extralight: "200",
            light: "300",
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
            extrabold: "800",
            black: "900"
          },
          gap: ({ theme: theme2 }) => theme2("spacing"),
          gradientColorStops: ({ theme: theme2 }) => theme2("colors"),
          gradientColorStopPositions: {
            "0%": "0%",
            "5%": "5%",
            "10%": "10%",
            "15%": "15%",
            "20%": "20%",
            "25%": "25%",
            "30%": "30%",
            "35%": "35%",
            "40%": "40%",
            "45%": "45%",
            "50%": "50%",
            "55%": "55%",
            "60%": "60%",
            "65%": "65%",
            "70%": "70%",
            "75%": "75%",
            "80%": "80%",
            "85%": "85%",
            "90%": "90%",
            "95%": "95%",
            "100%": "100%"
          },
          grayscale: {
            0: "0",
            DEFAULT: "100%"
          },
          gridAutoColumns: {
            auto: "auto",
            min: "min-content",
            max: "max-content",
            fr: "minmax(0, 1fr)"
          },
          gridAutoRows: {
            auto: "auto",
            min: "min-content",
            max: "max-content",
            fr: "minmax(0, 1fr)"
          },
          gridColumn: {
            auto: "auto",
            "span-1": "span 1 / span 1",
            "span-2": "span 2 / span 2",
            "span-3": "span 3 / span 3",
            "span-4": "span 4 / span 4",
            "span-5": "span 5 / span 5",
            "span-6": "span 6 / span 6",
            "span-7": "span 7 / span 7",
            "span-8": "span 8 / span 8",
            "span-9": "span 9 / span 9",
            "span-10": "span 10 / span 10",
            "span-11": "span 11 / span 11",
            "span-12": "span 12 / span 12",
            "span-full": "1 / -1"
          },
          gridColumnEnd: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13"
          },
          gridColumnStart: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13"
          },
          gridRow: {
            auto: "auto",
            "span-1": "span 1 / span 1",
            "span-2": "span 2 / span 2",
            "span-3": "span 3 / span 3",
            "span-4": "span 4 / span 4",
            "span-5": "span 5 / span 5",
            "span-6": "span 6 / span 6",
            "span-7": "span 7 / span 7",
            "span-8": "span 8 / span 8",
            "span-9": "span 9 / span 9",
            "span-10": "span 10 / span 10",
            "span-11": "span 11 / span 11",
            "span-12": "span 12 / span 12",
            "span-full": "1 / -1"
          },
          gridRowEnd: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13"
          },
          gridRowStart: {
            auto: "auto",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12",
            13: "13"
          },
          gridTemplateColumns: {
            none: "none",
            subgrid: "subgrid",
            1: "repeat(1, minmax(0, 1fr))",
            2: "repeat(2, minmax(0, 1fr))",
            3: "repeat(3, minmax(0, 1fr))",
            4: "repeat(4, minmax(0, 1fr))",
            5: "repeat(5, minmax(0, 1fr))",
            6: "repeat(6, minmax(0, 1fr))",
            7: "repeat(7, minmax(0, 1fr))",
            8: "repeat(8, minmax(0, 1fr))",
            9: "repeat(9, minmax(0, 1fr))",
            10: "repeat(10, minmax(0, 1fr))",
            11: "repeat(11, minmax(0, 1fr))",
            12: "repeat(12, minmax(0, 1fr))"
          },
          gridTemplateRows: {
            none: "none",
            subgrid: "subgrid",
            1: "repeat(1, minmax(0, 1fr))",
            2: "repeat(2, minmax(0, 1fr))",
            3: "repeat(3, minmax(0, 1fr))",
            4: "repeat(4, minmax(0, 1fr))",
            5: "repeat(5, minmax(0, 1fr))",
            6: "repeat(6, minmax(0, 1fr))",
            7: "repeat(7, minmax(0, 1fr))",
            8: "repeat(8, minmax(0, 1fr))",
            9: "repeat(9, minmax(0, 1fr))",
            10: "repeat(10, minmax(0, 1fr))",
            11: "repeat(11, minmax(0, 1fr))",
            12: "repeat(12, minmax(0, 1fr))"
          },
          height: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            "1/5": "20%",
            "2/5": "40%",
            "3/5": "60%",
            "4/5": "80%",
            "1/6": "16.666667%",
            "2/6": "33.333333%",
            "3/6": "50%",
            "4/6": "66.666667%",
            "5/6": "83.333333%",
            full: "100%",
            screen: "100vh",
            svh: "100svh",
            lvh: "100lvh",
            dvh: "100dvh",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          hueRotate: {
            0: "0deg",
            15: "15deg",
            30: "30deg",
            60: "60deg",
            90: "90deg",
            180: "180deg"
          },
          inset: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            full: "100%"
          }),
          invert: {
            0: "0",
            DEFAULT: "100%"
          },
          keyframes: {
            spin: {
              to: {
                transform: "rotate(360deg)"
              }
            },
            ping: {
              "75%, 100%": {
                transform: "scale(2)",
                opacity: "0"
              }
            },
            pulse: {
              "50%": {
                opacity: ".5"
              }
            },
            bounce: {
              "0%, 100%": {
                transform: "translateY(-25%)",
                animationTimingFunction: "cubic-bezier(0.8,0,1,1)"
              },
              "50%": {
                transform: "none",
                animationTimingFunction: "cubic-bezier(0,0,0.2,1)"
              }
            }
          },
          letterSpacing: {
            tighter: "-0.05em",
            tight: "-0.025em",
            normal: "0em",
            wide: "0.025em",
            wider: "0.05em",
            widest: "0.1em"
          },
          lineHeight: {
            none: "1",
            tight: "1.25",
            snug: "1.375",
            normal: "1.5",
            relaxed: "1.625",
            loose: "2",
            3: ".75rem",
            4: "1rem",
            5: "1.25rem",
            6: "1.5rem",
            7: "1.75rem",
            8: "2rem",
            9: "2.25rem",
            10: "2.5rem"
          },
          listStyleType: {
            none: "none",
            disc: "disc",
            decimal: "decimal"
          },
          listStyleImage: {
            none: "none"
          },
          margin: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing")
          }),
          lineClamp: {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6"
          },
          maxHeight: ({ theme: theme2 }) => ({
            ...theme2("spacing"),
            none: "none",
            full: "100%",
            screen: "100vh",
            svh: "100svh",
            lvh: "100lvh",
            dvh: "100dvh",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          maxWidth: ({ theme: theme2, breakpoints }) => ({
            ...theme2("spacing"),
            none: "none",
            xs: "20rem",
            sm: "24rem",
            md: "28rem",
            lg: "32rem",
            xl: "36rem",
            "2xl": "42rem",
            "3xl": "48rem",
            "4xl": "56rem",
            "5xl": "64rem",
            "6xl": "72rem",
            "7xl": "80rem",
            full: "100%",
            min: "min-content",
            max: "max-content",
            fit: "fit-content",
            prose: "65ch",
            ...breakpoints(theme2("screens"))
          }),
          minHeight: ({ theme: theme2 }) => ({
            ...theme2("spacing"),
            full: "100%",
            screen: "100vh",
            svh: "100svh",
            lvh: "100lvh",
            dvh: "100dvh",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          minWidth: ({ theme: theme2 }) => ({
            ...theme2("spacing"),
            full: "100%",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          objectPosition: {
            bottom: "bottom",
            center: "center",
            left: "left",
            "left-bottom": "left bottom",
            "left-top": "left top",
            right: "right",
            "right-bottom": "right bottom",
            "right-top": "right top",
            top: "top"
          },
          opacity: {
            0: "0",
            5: "0.05",
            10: "0.1",
            15: "0.15",
            20: "0.2",
            25: "0.25",
            30: "0.3",
            35: "0.35",
            40: "0.4",
            45: "0.45",
            50: "0.5",
            55: "0.55",
            60: "0.6",
            65: "0.65",
            70: "0.7",
            75: "0.75",
            80: "0.8",
            85: "0.85",
            90: "0.9",
            95: "0.95",
            100: "1"
          },
          order: {
            first: "-9999",
            last: "9999",
            none: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "11",
            12: "12"
          },
          outlineColor: ({ theme: theme2 }) => theme2("colors"),
          outlineOffset: {
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          outlineWidth: {
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          padding: ({ theme: theme2 }) => theme2("spacing"),
          placeholderColor: ({ theme: theme2 }) => theme2("colors"),
          placeholderOpacity: ({ theme: theme2 }) => theme2("opacity"),
          ringColor: ({ theme: theme2 }) => ({
            DEFAULT: theme2("colors.blue.500", "#3b82f6"),
            ...theme2("colors")
          }),
          ringOffsetColor: ({ theme: theme2 }) => theme2("colors"),
          ringOffsetWidth: {
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          ringOpacity: ({ theme: theme2 }) => ({
            DEFAULT: "0.5",
            ...theme2("opacity")
          }),
          ringWidth: {
            DEFAULT: "3px",
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          rotate: {
            0: "0deg",
            1: "1deg",
            2: "2deg",
            3: "3deg",
            6: "6deg",
            12: "12deg",
            45: "45deg",
            90: "90deg",
            180: "180deg"
          },
          saturate: {
            0: "0",
            50: ".5",
            100: "1",
            150: "1.5",
            200: "2"
          },
          scale: {
            0: "0",
            50: ".5",
            75: ".75",
            90: ".9",
            95: ".95",
            100: "1",
            105: "1.05",
            110: "1.1",
            125: "1.25",
            150: "1.5"
          },
          screens: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px"
          },
          scrollMargin: ({ theme: theme2 }) => ({
            ...theme2("spacing")
          }),
          scrollPadding: ({ theme: theme2 }) => theme2("spacing"),
          sepia: {
            0: "0",
            DEFAULT: "100%"
          },
          skew: {
            0: "0deg",
            1: "1deg",
            2: "2deg",
            3: "3deg",
            6: "6deg",
            12: "12deg"
          },
          space: ({ theme: theme2 }) => ({
            ...theme2("spacing")
          }),
          spacing: {
            px: "1px",
            0: "0px",
            0.5: "0.125rem",
            1: "0.25rem",
            1.5: "0.375rem",
            2: "0.5rem",
            2.5: "0.625rem",
            3: "0.75rem",
            3.5: "0.875rem",
            4: "1rem",
            5: "1.25rem",
            6: "1.5rem",
            7: "1.75rem",
            8: "2rem",
            9: "2.25rem",
            10: "2.5rem",
            11: "2.75rem",
            12: "3rem",
            14: "3.5rem",
            16: "4rem",
            20: "5rem",
            24: "6rem",
            28: "7rem",
            32: "8rem",
            36: "9rem",
            40: "10rem",
            44: "11rem",
            48: "12rem",
            52: "13rem",
            56: "14rem",
            60: "15rem",
            64: "16rem",
            72: "18rem",
            80: "20rem",
            96: "24rem"
          },
          stroke: ({ theme: theme2 }) => ({
            none: "none",
            ...theme2("colors")
          }),
          strokeWidth: {
            0: "0",
            1: "1",
            2: "2"
          },
          supports: {},
          data: {},
          textColor: ({ theme: theme2 }) => theme2("colors"),
          textDecorationColor: ({ theme: theme2 }) => theme2("colors"),
          textDecorationThickness: {
            auto: "auto",
            "from-font": "from-font",
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          textIndent: ({ theme: theme2 }) => ({
            ...theme2("spacing")
          }),
          textOpacity: ({ theme: theme2 }) => theme2("opacity"),
          textUnderlineOffset: {
            auto: "auto",
            0: "0px",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px"
          },
          transformOrigin: {
            center: "center",
            top: "top",
            "top-right": "top right",
            right: "right",
            "bottom-right": "bottom right",
            bottom: "bottom",
            "bottom-left": "bottom left",
            left: "left",
            "top-left": "top left"
          },
          transitionDelay: {
            0: "0s",
            75: "75ms",
            100: "100ms",
            150: "150ms",
            200: "200ms",
            300: "300ms",
            500: "500ms",
            700: "700ms",
            1e3: "1000ms"
          },
          transitionDuration: {
            DEFAULT: "150ms",
            0: "0s",
            75: "75ms",
            100: "100ms",
            150: "150ms",
            200: "200ms",
            300: "300ms",
            500: "500ms",
            700: "700ms",
            1e3: "1000ms"
          },
          transitionProperty: {
            none: "none",
            all: "all",
            DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
            colors: "color, background-color, border-color, text-decoration-color, fill, stroke",
            opacity: "opacity",
            shadow: "box-shadow",
            transform: "transform"
          },
          transitionTimingFunction: {
            DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
            linear: "linear",
            in: "cubic-bezier(0.4, 0, 1, 1)",
            out: "cubic-bezier(0, 0, 0.2, 1)",
            "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
          },
          translate: ({ theme: theme2 }) => ({
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            full: "100%"
          }),
          size: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            "1/5": "20%",
            "2/5": "40%",
            "3/5": "60%",
            "4/5": "80%",
            "1/6": "16.666667%",
            "2/6": "33.333333%",
            "3/6": "50%",
            "4/6": "66.666667%",
            "5/6": "83.333333%",
            "1/12": "8.333333%",
            "2/12": "16.666667%",
            "3/12": "25%",
            "4/12": "33.333333%",
            "5/12": "41.666667%",
            "6/12": "50%",
            "7/12": "58.333333%",
            "8/12": "66.666667%",
            "9/12": "75%",
            "10/12": "83.333333%",
            "11/12": "91.666667%",
            full: "100%",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          width: ({ theme: theme2 }) => ({
            auto: "auto",
            ...theme2("spacing"),
            "1/2": "50%",
            "1/3": "33.333333%",
            "2/3": "66.666667%",
            "1/4": "25%",
            "2/4": "50%",
            "3/4": "75%",
            "1/5": "20%",
            "2/5": "40%",
            "3/5": "60%",
            "4/5": "80%",
            "1/6": "16.666667%",
            "2/6": "33.333333%",
            "3/6": "50%",
            "4/6": "66.666667%",
            "5/6": "83.333333%",
            "1/12": "8.333333%",
            "2/12": "16.666667%",
            "3/12": "25%",
            "4/12": "33.333333%",
            "5/12": "41.666667%",
            "6/12": "50%",
            "7/12": "58.333333%",
            "8/12": "66.666667%",
            "9/12": "75%",
            "10/12": "83.333333%",
            "11/12": "91.666667%",
            full: "100%",
            screen: "100vw",
            svw: "100svw",
            lvw: "100lvw",
            dvw: "100dvw",
            min: "min-content",
            max: "max-content",
            fit: "fit-content"
          }),
          willChange: {
            auto: "auto",
            scroll: "scroll-position",
            contents: "contents",
            transform: "transform"
          },
          zIndex: {
            auto: "auto",
            0: "0",
            10: "10",
            20: "20",
            30: "30",
            40: "40",
            50: "50"
          }
        },
        plugins: []
      };
    }
  });

  // node_modules/tailwindcss/lib/public/default-theme.js
  var require_default_theme = __commonJS({
    "node_modules/tailwindcss/lib/public/default-theme.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "default", {
        enumerable: true,
        get: function() {
          return _default;
        }
      });
      var _cloneDeep = require_cloneDeep();
      var _configfull = /* @__PURE__ */ _interop_require_default(require_config_full());
      function _interop_require_default(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      var _default = (0, _cloneDeep.cloneDeep)(_configfull.default.theme);
    }
  });

  // node_modules/tailwindcss/defaultTheme.js
  var require_defaultTheme = __commonJS({
    "node_modules/tailwindcss/defaultTheme.js"(exports, module) {
      var defaultTheme2 = require_default_theme();
      module.exports = (defaultTheme2.__esModule ? defaultTheme2 : { default: defaultTheme2 }).default;
    }
  });

  // node_modules/@kosik/ui/libs/tailwind/tailwindAnimate.js
  var import_plugin = __toESM(require_plugin(), 1);
  function filterDefault(values) {
    return Object.fromEntries(Object.entries(values).filter(([key]) => key !== "DEFAULT"));
  }
  var tailwindAnimate = (0, import_plugin.default)(
    ({
      addUtilities,
      matchUtilities,
      theme: theme2
    }) => {
      addUtilities({
        "@keyframes enter": theme2("keyframes.enter"),
        "@keyframes exit": theme2("keyframes.exit"),
        ".animate-in": {
          animationName: "enter",
          "--tw-enter-opacity": "initial",
          "--tw-enter-scale": "initial",
          "--tw-enter-rotate": "initial",
          "--tw-enter-translate-x": "initial",
          "--tw-enter-translate-y": "initial"
        },
        ".animate-out": {
          animationName: "exit",
          "--tw-exit-opacity": "initial",
          "--tw-exit-scale": "initial",
          "--tw-exit-rotate": "initial",
          "--tw-exit-translate-x": "initial",
          "--tw-exit-translate-y": "initial"
        }
      });
      matchUtilities(
        {
          "fade-in": (value) => ({ "--tw-enter-opacity": value }),
          "fade-out": (value) => ({ "--tw-exit-opacity": value })
        },
        { values: theme2("animationOpacity") }
      );
      matchUtilities(
        {
          "zoom-in": (value) => ({ "--tw-enter-scale": value }),
          "zoom-out": (value) => ({ "--tw-exit-scale": value })
        },
        { values: theme2("animationScale") }
      );
      matchUtilities(
        {
          "spin-in": (value) => ({ "--tw-enter-rotate": value }),
          "spin-out": (value) => ({ "--tw-exit-rotate": value })
        },
        { values: theme2("animationRotate") }
      );
      matchUtilities(
        {
          "slide-in-from-top": (value) => ({
            "--tw-enter-translate-y": `-${value}`
          }),
          "slide-in-from-bottom": (value) => ({
            "--tw-enter-translate-y": value
          }),
          "slide-in-from-left": (value) => ({
            "--tw-enter-translate-x": `-${value}`
          }),
          "slide-in-from-right": (value) => ({
            "--tw-enter-translate-x": value
          }),
          "slide-out-to-top": (value) => ({
            "--tw-exit-translate-y": `-${value}`
          }),
          "slide-out-to-bottom": (value) => ({
            "--tw-exit-translate-y": value
          }),
          "slide-out-to-left": (value) => ({
            "--tw-exit-translate-x": `-${value}`
          }),
          "slide-out-to-right": (value) => ({
            "--tw-exit-translate-x": value
          })
        },
        { values: theme2("animationTranslate") }
      );
      matchUtilities(
        { "animation-duration": (value) => ({ animationDuration: value }) },
        { values: filterDefault(theme2("animationDuration")) }
      );
      matchUtilities(
        { "animation-delay": (value) => ({ animationDelay: value }) },
        { values: theme2("animationDelay") }
      );
      matchUtilities(
        { "animation-ease": (value) => ({ animationTimingFunction: value }) },
        { values: filterDefault(theme2("animationTimingFunction")) }
      );
      addUtilities({
        ".running": { animationPlayState: "running" },
        ".paused": { animationPlayState: "paused" }
      });
      matchUtilities(
        { "animation-fill": (value) => ({ animationFillMode: value }) },
        { values: theme2("animationFillMode") }
      );
      matchUtilities(
        { "animation-direction": (value) => ({ animationDirection: value }) },
        { values: theme2("animationDirection") }
      );
      matchUtilities(
        { "animation-repeat": (value) => ({ animationIterationCount: value }) },
        { values: theme2("animationRepeat") }
      );
    },
    {
      theme: {
        extend: {
          animationDelay: ({ theme: theme2 }) => ({
            ...theme2("transitionDelay")
          }),
          animationDuration: ({ theme: theme2 }) => ({
            0: "0ms",
            ...theme2("transitionDuration")
          }),
          animationTimingFunction: ({ theme: theme2 }) => ({
            ...theme2("transitionTimingFunction")
          }),
          animationFillMode: {
            none: "none",
            forwards: "forwards",
            backwards: "backwards",
            both: "both"
          },
          animationDirection: {
            normal: "normal",
            reverse: "reverse",
            alternate: "alternate",
            "alternate-reverse": "alternate-reverse"
          },
          animationOpacity: ({ theme: theme2 }) => ({
            DEFAULT: 0,
            ...theme2("opacity")
          }),
          animationTranslate: ({ theme: theme2 }) => ({
            DEFAULT: "100%",
            ...theme2("translate")
          }),
          animationScale: ({ theme: theme2 }) => ({
            DEFAULT: 0,
            ...theme2("scale")
          }),
          animationRotate: ({ theme: theme2 }) => ({
            DEFAULT: "30deg",
            ...theme2("rotate")
          }),
          animationRepeat: {
            0: "0",
            1: "1",
            infinite: "infinite"
          },
          keyframes: {
            enter: {
              from: {
                opacity: "var(--tw-enter-opacity, 1)",
                transform: "translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))"
              }
            },
            exit: {
              to: {
                opacity: "var(--tw-exit-opacity, 1)",
                transform: "translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))"
              }
            }
          }
        }
      }
    }
  );

  // node_modules/@kosik/ui/libs/tailwind/tailwindPlugin.js
  var import_defaultTheme = __toESM(require_defaultTheme(), 1);
  var import_plugin2 = __toESM(require_plugin(), 1);

  // node_modules/@kosik/ui/libs/tailwind/flattenColorPalette.js
  function flattenColorPalette(colors) {
    return Object.assign(
      {},
      ...Object.entries(colors ?? {}).flatMap(
        ([color, values]) => typeof values === "object" ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
          [color + (number === "DEFAULT" ? "" : `-${number}`)]: hex
        })) : [{ [`${color}`]: values }]
      )
    );
  }

  // node_modules/@kosik/ui/libs/tailwind/tailwindPlugin.js
  var purple = {
    5: "#FBF6FF",
    10: "#F8EDFF",
    20: "#F4E4FF",
    30: "#E4CDF3",
    40: "#D4B5E7",
    50: "#C49EDB",
    60: "#B184C4",
    70: "#9E6AAD",
    80: "#8B4F97",
    90: "#783580",
    100: "#651B69"
  };
  var teal = {
    5: "#F3F9FA",
    10: "#E8F3F5",
    20: "#D1E7EB",
    30: "#BADBE1",
    40: "#8CC3CD",
    50: "#76B8C2",
    60: "#5FACB8",
    70: "#48A0AE",
    80: "#1A889A",
    90: "#037C90",
    100: "#096675"
  };
  var baseColors = {
    purple,
    teal,
    /** @deprecated, use 'dr-max' instead */
    "3rd-party-dr-max": {
      green: {
        DEFAULT: "#4BAA28",
        light: "#C9E5BE"
      }
    },
    "dr-max": {
      green: {
        DEFAULT: "#4BAA28",
        light: "#C9E5BE"
      }
    },
    accent: {
      blue: "#4468E8",
      green: "#198754",
      orange: "#FFA115",
      red: "#DC3545",
      yellow: "#FFCE3C"
    },
    "brown-dark": "#644A08",
    complementary: "#493E4A",
    "yellow-banana": "#FFEAA9",
    green: {
      DEFAULT: "#82c76b",
      light: "#D6EAD1"
    },
    peach: {
      DEFAULT: "#F79E5C",
      light: "#FBCFAD"
    },
    pink: {
      DEFAULT: "#E54070",
      light: "#F6C1C3",
      punch: {
        DEFAULT: "#E33164",
        light: "#F198B2"
      },
      amaranth: {
        DEFAULT: "#E01F56"
      }
    },
    orange: {
      sweet: {
        DEFAULT: "#FA7D20",
        light: "#F9BA8A"
      }
    },
    tangerine: {
      DEFAULT: "#F88835",
      light: "#F8D1AF"
    },
    contrast: {
      green: {
        DEFAULT: "#198754",
        dark: "#136941",
        off: "#B7D9C2"
      },
      red: "#DC3545"
    },
    neutral: {
      0: "#FFFFFF",
      2: "#F6F6F6",
      5: "#F0F0F0",
      10: "#E9E9E9",
      20: "#D3D3D3",
      30: "#BDBDBD",
      40: "#A8A8A8",
      50: "#929292",
      60: "#7C7C7C",
      70: "#666666",
      80: "#444444",
      90: "#222222",
      100: "#000000"
    },
    primary: {
      DEFAULT: purple[100],
      light: purple[20],
      mid: purple[50],
      "off-light": purple[30],
      "off-mid": purple[80]
    },
    secondary: "#FFF5E5",
    market: {
      primary: teal[90],
      mid: teal[40],
      "off-mid": teal[70],
      light: teal[10],
      "off-light": teal[20],
      contrast: teal[100]
    },
    tint: {
      blue: "#F3F5FE",
      green: "#EFF7F4",
      highlight: {
        green: "#F2FEF6",
        red: "#FFF3F4"
      },
      orange: "#FFF7F2",
      red: "#FDF3F3"
    }
  };
  var theme = {
    colors: {
      ds: {
        ...baseColors,
        state: {
          error: baseColors.accent.red,
          success: baseColors.accent.green,
          info: baseColors.accent.blue,
          warning: baseColors.accent.orange
        },
        form: {
          "control-accent": baseColors.complementary,
          active: baseColors.accent.blue
        },
        icon: (() => {
          const base = {
            neutral: baseColors.neutral["80"],
            main: baseColors.primary.DEFAULT,
            additional: baseColors.primary.mid
          };
          return {
            ...base,
            club: {
              "benjaminek-additional": baseColors.pink.punch.light,
              benjaminek: baseColors.pink.punch.DEFAULT,
              "main-additional": base.additional,
              main: base.main,
              "plna-pece-additional": baseColors.orange.sweet.light,
              "plna-pece": baseColors.orange.sweet.DEFAULT
            }
          };
        })()
      }
    },
    borderColor: {
      ds: {
        form: {
          DEFAULT: baseColors.neutral["30"],
          error: baseColors.contrast.red
        }
      }
    },
    textColor: (() => {
      const base = {
        body: baseColors.neutral["90"],
        disabled: baseColors.neutral["60"],
        discount: baseColors.contrast.red,
        link: baseColors.primary.DEFAULT,
        "on-status-bg": baseColors.neutral["90"],
        paragraph: baseColors.neutral["90"],
        "paragraph-alternative": baseColors.neutral["70"],
        "paragraph-inverse": baseColors.neutral["0"],
        pharmacy: baseColors.contrast.green.dark,
        "standalone-error": baseColors.contrast.red,
        "standalone-success": baseColors.contrast.green.DEFAULT,
        subtitle: baseColors.neutral["70"],
        title: baseColors.neutral["80"]
      };
      return {
        ds: {
          ...base,
          form: {
            "label-error": base["standalone-error"],
            label: base.paragraph,
            "placeholder-disabled": baseColors.neutral["70"],
            placeholder: baseColors.neutral["50"],
            "supporting-text": base["standalone-error"],
            error: base["standalone-error"],
            text: base.paragraph
          },
          button: {
            "ghost-disabled": base.disabled,
            ghost: baseColors.primary.DEFAULT,
            "primary-disabled": base.disabled,
            primary: base["paragraph-inverse"],
            "secondary-stroke-disabled": baseColors.neutral["20"],
            "secondary-stroke": baseColors.primary.DEFAULT,
            "secondary-disabled": base.disabled,
            secondary: baseColors.primary.DEFAULT,
            "super-primary-disabled": base["paragraph-inverse"],
            "super-primary": base["paragraph-inverse"],
            "tertiary-disabled": base.disabled,
            tertiary: baseColors.primary.DEFAULT
          }
        }
      };
    })(),
    backgroundColor: (() => {
      const base = {
        "level-0": baseColors.neutral["0"],
        "level-1": baseColors.neutral["2"],
        "level-2": baseColors.neutral["5"],
        "level-3": baseColors.neutral["10"],
        disabled: baseColors.neutral["10"],
        discount: baseColors.secondary,
        error: baseColors.tint.red,
        highlight: baseColors.peach.light,
        hover: baseColors.neutral["2"],
        info: baseColors.tint.blue,
        overlay: "rgb(0 0 0 / 0.3)",
        pharmacy: baseColors.contrast.green.dark,
        success: baseColors.tint.green,
        warning: baseColors.tint.orange,
        feedback: baseColors.green.light
      };
      return {
        ds: {
          ...base,
          button: {
            "ghost-active": baseColors.primary.light,
            "ghost-hover": baseColors.primary.light,
            "primary-active": baseColors.primary["off-mid"],
            "primary-disabled": base.disabled,
            "primary-hover": baseColors.primary["off-mid"],
            primary: baseColors.primary.DEFAULT,
            "secondary-active": baseColors.primary.light,
            "secondary-disabled": base["level-0"],
            "secondary-hover": baseColors.primary.light,
            secondary: base["level-0"],
            "secondary-stroke-disabled": baseColors.neutral["20"],
            "secondary-stroke": baseColors.primary.DEFAULT,
            "super-primary-active": baseColors.contrast.green.dark,
            "super-primary-disabled": baseColors.contrast.green.off,
            "super-primary-hover": baseColors.contrast.green.dark,
            "super-primary": baseColors.contrast.green.DEFAULT,
            "tertiary-active": baseColors.primary["off-light"],
            "tertiary-disabled": base.disabled,
            "tertiary-hover": baseColors.primary["off-light"],
            tertiary: baseColors.primary.light
          }
        }
      };
    })(),
    boxShadow: {
      "ds-1": "0px 2px 4px 0px rgba(0, 0, 0, 0.06), 0px 0px 4px 0px rgba(0, 0, 0, 0.06)",
      "ds-2": "2px 4px 8px 0px rgba(0, 0, 0, 0.08), -2px 4px 8px 0px rgba(0, 0, 0, 0.08)"
    },
    borderRadius: {
      // 'ds-xs': '0.125rem',
      "ds-sm": "0.25rem",
      // 'ds-md': '0.375rem',
      "ds-lg": "0.5rem",
      "ds-xl": "0.75rem",
      "ds-2xl": "1rem",
      "ds-3xl": "1.5rem"
    },
    fontFamily: {
      "ds-body": ["Inter", "sans-serif"]
    },
    fontWeight: {
      "ds-title": "500",
      "ds-semi-strong": "500",
      "ds-strong": "550",
      "ds-stronger": "650",
      // backward compatibility
      "ds-semibold": "550"
    },
    screens: {
      "ds-sm": "576px",
      "ds-md": "768px",
      "ds-lg": "992px",
      "ds-xl": "1200px",
      "ds-xxl": "1400px"
    },
    // Reka
    keyframes: {
      "ds-hide": {
        from: { opacity: "1" },
        to: { opacity: "0" }
      },
      "ds-fade-in": {
        from: { opacity: "0" },
        to: { opacity: "1" }
      },
      "ds-fade-out": {
        from: { opacity: "1" },
        to: { opacity: "0" }
      },
      "ds-slideIn": {
        from: { transform: "translateX(calc(100% + var(--viewport-padding)))" },
        to: { transform: "translateX(0)" }
      },
      "ds-slideOut": {
        from: { transform: "translateX(0)" },
        to: { opacity: "0", transform: "translateX(calc(100% + var(--viewport-padding)))" }
      },
      "ds-swipeOut": {
        from: { transform: "translateX(var(--reka-toast-swipe-end-x))" },
        to: { transform: "translateX(calc(100% + var(--viewport-padding)))" }
      },
      "ds-pulse-green": {
        "50%": { backgroundColor: "#d6ead1" }
      },
      "ds-skeleton": {
        "0%": { backgroundColor: baseColors.neutral["10"] },
        "100%": { backgroundColor: baseColors.neutral["20"] }
      },
      "ds-accordion-down": {
        from: { height: "0" },
        to: { height: "var(--reka-accordion-content-height)" }
      },
      "ds-accordion-up": {
        from: { height: "var(--reka-accordion-content-height)" },
        to: { height: "0" }
      },
      "ds-main-nav-slide-in": {
        "0%": {
          opacity: "0",
          transform: "translateY(calc(var(--ds-main-nav-slide-distance) * var(--ds-main-nav-slide-direction)))"
        },
        "100%": {
          opacity: "1"
        }
      },
      "ds-main-nav-slide-out": {
        "0%": {
          opacity: "1"
        },
        "100%": {
          opacity: "0",
          transform: "translateY(calc(-1 * var(--ds-main-nav-slide-distance) * var(--ds-main-nav-slide-direction)))"
        }
      },
      "ds-collapsible-down": {
        from: { height: "0", opacity: "0" },
        to: { height: "var(--reka-collapsible-content-height)" }
      },
      "ds-collapsible-up": {
        from: { height: "var(--reka-collapsible-content-height)" },
        to: { height: "0", opacity: "0" }
      }
    },
    animation: {
      "ds-hide": "ds-hide 200ms ease-in",
      "ds-fade-in": "ds-fade-in 200ms",
      "ds-fade-out": "ds-fade-out 200ms",
      "ds-slideIn": "ds-slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      "ds-slideOut": "ds-slideOut 150ms ease-out",
      "ds-swipeOut": "ds-swipeOut 100ms ease-out",
      "ds-pulse-green": "ds-pulse-green 800ms ease-in-out",
      "ds-skeleton": "ds-skeleton 1s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate-reverse",
      "ds-accordion-down": "ds-accordion-down 0.2s ease-out",
      "ds-accordion-up": "ds-accordion-up 0.2s ease-out",
      "ds-main-nav-slide-in": "ds-main-nav-slide-in 500ms ease-in-out",
      "ds-main-nav-slide-out": "ds-main-nav-slide-out 500ms ease-in-out",
      "ds-collapsible-up": "ds-collapsible-up 0.2s ease-out",
      "ds-collapsible-down": "ds-collapsible-down 0.2s ease-out"
    },
    zIndex: {
      "ds-overlay": "var(--ds-overlay-z-index, 50)",
      "ds-toast": "var(--ds-toast-z-index, 51)",
      "ds-dropdown": "10"
    }
  };
  var dsIconSizes = {
    16: "1rem",
    20: "1.25rem",
    24: "1.5rem",
    30: "1.875rem",
    36: "2.25rem",
    42: "2.625rem",
    50: "3.125rem",
    60: "3.75rem",
    72: "4.5rem",
    full: "100%"
  };
  var oldDsIconSizes = {
    xs: dsIconSizes["16"],
    sm: dsIconSizes["20"],
    md: dsIconSizes["24"],
    lg: dsIconSizes["30"],
    xl: dsIconSizes["36"],
    "2xl": dsIconSizes["42"],
    "3xl": dsIconSizes["50"],
    "4xl": dsIconSizes["60"],
    "5xl": dsIconSizes["72"]
  };
  function prefixObjectKeysWithDs(object) {
    return Object.fromEntries(Object.entries(object).map(([key, value]) => [`ds-${key}`, value]));
  }
  var iconSizes = {
    ...import_defaultTheme.default.spacing,
    ...prefixObjectKeysWithDs(oldDsIconSizes),
    ...prefixObjectKeysWithDs(dsIconSizes)
  };
  var fontSizes = {
    xs: { mobile: "0.6875rem", desktop: "0.6875rem" },
    sm: { mobile: "0.75rem", desktop: "0.75rem" },
    base: { mobile: "0.875rem", desktop: "0.875rem" },
    lg: { mobile: "1rem", desktop: "1rem" },
    xl: { mobile: "1rem", desktop: "1.125rem" },
    "2xl": { mobile: "1.125rem", desktop: "1.25rem" },
    "3xl": { mobile: "1.25rem", desktop: "1.5rem" },
    "4xl": { mobile: "1.5rem", desktop: "1.75rem" },
    "5xl": { mobile: "1.75rem", desktop: "2rem" }
  };
  var textStyles = [
    {
      name: "xs",
      fontSize: fontSizes["xs"],
      lineHeight: { mobile: "1rem", desktop: "1rem" }
    },
    {
      name: "sm",
      fontSize: fontSizes["sm"],
      lineHeight: { mobile: "1rem", desktop: "1rem" }
    },
    {
      name: "sm-strong",
      fontSize: fontSizes["sm"],
      fontWeight: theme.fontWeight["ds-strong"],
      lineHeight: { mobile: "1rem", desktop: "1rem" }
    },
    {
      name: "text",
      fontSize: fontSizes["base"],
      lineHeight: { mobile: "1.125rem", desktop: "1.125rem" }
    },
    {
      name: "text-strong",
      fontSize: fontSizes["base"],
      fontWeight: theme.fontWeight["ds-strong"],
      lineHeight: { mobile: "1.125rem", desktop: "1.125rem" }
    },
    {
      name: "strong",
      fontSize: fontSizes["base"],
      fontWeight: theme.fontWeight["ds-strong"],
      lineHeight: { mobile: "1.125rem", desktop: "1.125rem" }
    },
    {
      name: "lg",
      fontSize: fontSizes["lg"],
      lineHeight: { mobile: "1.25rem", desktop: "1.375rem" }
    },
    {
      name: "lg-strong",
      fontSize: fontSizes["lg"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "1.25rem", desktop: "1.375rem" }
    },
    {
      name: "link",
      fontSize: fontSizes["base"],
      fontWeight: theme.fontWeight["ds-strong"],
      lineHeight: { mobile: "1.125rem", desktop: "1.125rem" }
    },
    {
      name: "paragraph-sm",
      fontSize: fontSizes["sm"],
      lineHeight: { mobile: "1.25rem", desktop: "1.25rem" }
    },
    {
      name: "paragraph",
      fontSize: fontSizes["base"],
      lineHeight: { mobile: "1.375rem", desktop: "1.375rem" }
    },
    {
      name: "paragraph-lg",
      fontSize: fontSizes["lg"],
      lineHeight: { mobile: "1.5rem", desktop: "1.5rem" }
    },
    {
      name: "xl",
      fontSize: fontSizes["xl"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "1.25rem", desktop: "1.375rem" }
    },
    {
      name: "2xl",
      fontSize: fontSizes["2xl"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "1.375rem", desktop: "1.5rem" }
    },
    {
      name: "3xl",
      fontSize: fontSizes["3xl"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "1.5rem", desktop: "1.75rem" }
    },
    {
      name: "4xl",
      fontSize: fontSizes["4xl"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "1.75rem", desktop: "2.1rem" }
    },
    {
      name: "5xl",
      fontSize: fontSizes["5xl"],
      fontWeight: theme.fontWeight["ds-title"],
      lineHeight: { mobile: "2.1rem", desktop: "2.4rem" }
    }
  ];
  var cssKeyframes = ["ds-fade-in", "ds-fade-out"];
  var tailwindPlugin = (0, import_plugin2.default)(
    ({ addVariant, matchVariant, matchUtilities, addUtilities, theme: themeFn }) => {
      addVariant("pointer-fine", "@media (pointer: fine)");
      addVariant("pointer-coarse", "@media (pointer: coarse)");
      addVariant("can-hover", "@media (hover: hover)");
      addVariant("no-hover", "@media (hover: none)");
      addVariant("hover-active", ["&:hover", "&:active"]);
      matchVariant(
        "group-hover-active",
        (value, { modifier }) => {
          const modifierString = modifier ? `\\/${modifier}` : "";
          return [
            `:merge(.group${modifierString}):hover &`,
            `:merge(.group${modifierString}):active &`
          ];
        },
        {
          values: {
            DEFAULT: ""
          }
        }
      );
      matchUtilities(
        {
          icon: (value) => ({
            "--ds-icon-size": value
          })
        },
        {
          values: iconSizes
        }
      );
      matchUtilities(
        {
          icon: (value) => ({
            "--ds-icon-fill": value
          })
        },
        {
          values: flattenColorPalette(themeFn("colors"))
        }
      );
      addUtilities(
        textStyles.map((config) => {
          const { name, ...style } = config;
          return {
            [`.text-style-${name}`]: {
              ...style.fontWeight && { fontWeight: style.fontWeight },
              ...style.lineHeight?.mobile && { lineHeight: style.lineHeight.mobile },
              fontSize: style.fontSize.mobile,
              ...style.fontSize.mobile !== style.fontSize.desktop ? {
                [`@media (min-width: ${theme.screens["ds-md"]})`]: {
                  fontSize: style.fontSize.desktop,
                  ...style.lineHeight?.desktop && { lineHeight: style.lineHeight.desktop }
                }
              } : {}
            }
          };
        })
      );
      addUtilities(
        Object.entries(fontSizes).map(([name, fontSize]) => {
          return {
            [`.text-ds-${name}`]: {
              fontSize: fontSize.mobile,
              ...fontSize.mobile !== fontSize.desktop ? {
                [`@media (min-width: ${theme.screens["ds-md"]})`]: {
                  fontSize: fontSize.desktop
                }
              } : {}
            }
          };
        })
      );
      addUtilities(
        cssKeyframes.map((name) => {
          return {
            [`.animation-name-${name}`]: {
              "animation-name": `${name}-css`
            }
          };
        })
      );
    },
    {
      theme: { extend: theme }
    }
  );

  // src/tailwind-setup.js
  window.tailwind.config = {
    prefix: "tw-",
    plugins: [tailwindAnimate, tailwindPlugin],
    theme: {
      extend: {
        // The app's breakpoints (apps/web/tailwind.config.ts theme.extend.screens).
        // Vendored DS components ship unprefixed responsive classes (`lg:`,
        // `max-lg:`) whose JS side switches at the app's 992px — with stock
        // Tailwind screens the CSS side would switch at 1024px instead.
        screens: {
          sm: "576px",
          md: "768px",
          lg: "992px",
          xl: "1200px",
          xxl: "1400px",
          "3xl": "1632px"
        },
        // DS overlay components use tw-z-ds-overlay internally; the app must supply it.
        zIndex: {
          "ds-overlay": "40"
        }
      }
    }
    // NOTE: unlike the app config, preflight stays enabled — standalone
    // prototypes have no other CSS reset to lean on.
  };
})();
