/* *
 *
 *  (c) 2009-2020 Øystein Moseng
 *
 *  Earcons for the sonification module in Highcharts.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import H from '../../parts/Globals.js';
import U from '../../parts/Utilities.js';
const {
    error,
    merge,
    pick,
    uniqueKey
} = U;

/**
 * Internal types.
 * @private
 */
declare global {
    namespace Highcharts {
        class Earcon {
            public constructor(options: EarconOptionsObject);
            public id: string;
            public instrumentsPlaying: Dictionary<Instrument>;
            public options: EarconOptionsObject;
            public cancelSonify(fadeOut?: boolean): void;
            public init(options: EarconOptionsObject): void;
            public sonify(options: EarconOptionsObject): void;
        }
        interface EarconInstrument {
            instrument: (string|Instrument);
            playOptions: InstrumentPlayOptionsObject;
        }
        interface EarconOptionsObject {
            id?: string;
            instruments: Array<EarconInstrument>;
            onEnd?: Function;
            pan?: number;
            volume?: number;
        }
    }
}

/**
 * Define an Instrument and the options for playing it.
 *
 * @requires module:modules/sonification
 *
 * @interface Highcharts.EarconInstrument
 *//**
 * An instrument instance or the name of the instrument in the
 * Highcharts.sonification.instruments map.
 * @name Highcharts.EarconInstrument#instrument
 * @type {string|Highcharts.Instrument}
 *//**
 * The options to pass to Instrument.play.
 * @name Highcharts.EarconInstrument#playOptions
 * @type {Highcharts.InstrumentPlayOptionsObject}
 */


/**
 * Options for an Earcon.
 *
 * @requires module:modules/sonification
 *
 * @interface Highcharts.EarconOptionsObject
 *//**
 * The instruments and their options defining this earcon.
 * @name Highcharts.EarconOptionsObject#instruments
 * @type {Array<Highcharts.EarconInstrument>}
 *//**
 * The unique ID of the Earcon. Generated if not supplied.
 * @name Highcharts.EarconOptionsObject#id
 * @type {string|undefined}
 *//**
 * Global panning of all instruments. Overrides all panning on individual
 * instruments. Can be a number between -1 and 1.
 * @name Highcharts.EarconOptionsObject#pan
 * @type {number|undefined}
 *//**
 * Master volume for all instruments. Volume settings on individual instruments
 * can still be used for relative volume between the instruments. This setting
 * does not affect volumes set by functions in individual instruments. Can be a
 * number between 0 and 1. Defaults to 1.
 * @name Highcharts.EarconOptionsObject#volume
 * @type {number|undefined}
 *//**
 * Callback function to call when earcon has finished playing.
 * @name Highcharts.EarconOptionsObject#onEnd
 * @type {Function|undefined}
 */

/* eslint-disable no-invalid-this, valid-jsdoc */

/**
 * The Earcon class. Earcon objects represent a certain sound consisting of
 * one or more instruments playing a predefined sound.
 *
 * @sample highcharts/sonification/earcon/
 *         Using earcons directly
 *
 * @requires module:modules/sonification
 *
 * @class
 * @name Highcharts.Earcon
 *
 * @param {Highcharts.EarconOptionsObject} options
 *        Options for the Earcon instance.
 */
function Earcon(
    this: Highcharts.Earcon,
    options: Highcharts.EarconOptionsObject
): void {
    this.init(options || {});
}
Earcon.prototype.init = function (
    this: Highcharts.Earcon,
    options: Highcharts.EarconOptionsObject
): void {
    this.options = options;
    if (!this.options.id) {
        this.options.id = this.id = uniqueKey();
    }
    this.instrumentsPlaying = {};
};


/**
 * Play the earcon, optionally overriding init options.
 *
 * @sample highcharts/sonification/earcon/
 *         Using earcons directly
 *
 * @function Highcharts.Earcon#sonify
 *
 * @param {Highcharts.EarconOptionsObject} options
 *        Override existing options.
 *
 * @return {void}
 */
Earcon.prototype.sonify = function (
    this: Highcharts.Earcon,
    options: Highcharts.EarconOptionsObject
): void {
    var playOptions = merge(this.options, options);

    // Find master volume/pan settings
    var masterVolume = pick(playOptions.volume, 1),
        masterPan = playOptions.pan,
        earcon = this,
        playOnEnd = options && options.onEnd,
        masterOnEnd = earcon.options.onEnd;

    // Go through the instruments and play them
    playOptions.instruments.forEach(function (
        opts: Highcharts.EarconInstrument
    ): void {
        var instrument = typeof opts.instrument === 'string' ?
                H.sonification.instruments[opts.instrument] : opts.instrument,
            instrumentOpts = merge(opts.playOptions),
            instrOnEnd: (Function|undefined),
            instrumentCopy,
            copyId = '';

        if (instrument && instrument.play) {
            if (opts.playOptions) {
                // Handle master pan/volume
                if (typeof opts.playOptions.volume !== 'function') {
                    instrumentOpts.volume = pick(masterVolume, 1) *
                        pick(opts.playOptions.volume, 1);
                }
                instrumentOpts.pan = pick(masterPan, instrumentOpts.pan);

                // Handle onEnd
                instrOnEnd = instrumentOpts.onEnd;
                instrumentOpts.onEnd = function (): void {
                    delete earcon.instrumentsPlaying[copyId];
                    if (instrOnEnd) {
                        instrOnEnd.apply(this, arguments);
                    }
                    if (!Object.keys(earcon.instrumentsPlaying).length) {
                        if (playOnEnd) {
                            playOnEnd.apply(this, arguments);
                        }
                        if (masterOnEnd) {
                            masterOnEnd.apply(this, arguments);
                        }
                    }
                };

                // Play the instrument. Use a copy so we can play multiple at
                // the same time.
                instrumentCopy = instrument.copy();
                copyId = instrumentCopy.id;
                earcon.instrumentsPlaying[copyId] = instrumentCopy;
                instrumentCopy.play(instrumentOpts);
            }
        } else {
            error(30);
        }
    });
};


/**
 * Cancel any current sonification of the Earcon. Calls onEnd functions.
 *
 * @function Highcharts.Earcon#cancelSonify
 *
 * @param {boolean} [fadeOut=false]
 *        Whether or not to fade out as we stop. If false, the earcon is
 *        cancelled synchronously.
 *
 * @return {void}
 */
Earcon.prototype.cancelSonify = function (
    this: Highcharts.Earcon,
    fadeOut?: boolean
): void {
    var playing = this.instrumentsPlaying,
        instrIds = playing && Object.keys(playing);

    if (instrIds && instrIds.length) {
        instrIds.forEach(function (instr: string): void {
            playing[instr].stop(!fadeOut, null as any, 'cancelled');
        });
        this.instrumentsPlaying = {};
    }
};


export default Earcon;
