import { AnalyticsConfigurationInterface } from './analytics-configuration.interface';

/**
 * any object that is passable to the utag object
 */
export interface UtagData {
    /**
     * utag key is of type string, assignable to all these data types
     */
    [Key: string]: string | number | boolean | string[] | {};
}

/**
 * Two events that Tealium uses for [track]{@link Analytics#track}
 */
export type TealiumEvent = 'link' | 'view';

/**
 * attributes that the script tag allows
 */
export interface UtagScript {
    /**
     * Name of the script
     */
    name: string;

    /**
     * Source for scripts
     */
    src: string;

    /**
     * Whether or not a script is loaded
     */
    loaded: boolean;
}

/**
 * Tealium analytics service
 * ### Installation
 * Run in the directory where your `package.json` is located to install
 * both the components and [ui](https://ghe.aa.com/AA-CustTech-Platform/aileron-ui) peer dependency:
 ```bash
 npm i -S @aileron/{components,ui} --registry https://packages.aa.com/artifactory/api/npm/AA-internal-npm/
 ```
 * ### Usage:
 * `app.component.ts` example:
 ```ts
 import { AnalyticsService } from '@aileron/components/services';
 import { Component, AfterViewInit } from '@angular/core';

 @Component({
  ...
})
 export class AppComponent implements AfterViewInit {
  constructor(private analytics: AnalyticsService) {}

  ngAfterViewInit() {
    this.analytics.view({
      sampleEventName: 'example_event_value'
    });
  }
}
 ```
 */

/**
 * Passing tealium values
 */
/**
 * Whether or not a script is loaded
 */


/**
 * Two events that Tealium uses for [track]{@link Analytics#track}
 */
export class AnalyticsService {

    /**
     * default aileron verion
     */
    private VERSION = '3.0.0';

    /**
     * default environment
     */
    private env = 'prod';

    /**
     * default profile
     */
    private profile = 'main';


    /**
     * script array
     */
    public tealiumScripts: UtagScript[] = [];

    /**
     * List of scripts used for analytics
     */
    public setScripts(tealium: any) {
        this.env = tealium.environment;
        /**
         * Two events that Tealium uses for [track]{@link Analytics#track}
         */
        this.tealiumScripts = [
            {
                /**
                 * Script name
                 */
                name: 'jquery',
                /**
                 * Script source
                 */
                src: `https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js`,
                /**
                 * Whether or not a script is loaded
                 */
                loaded: false
            },
            {
                /**
                 * Script name
                 */
                name: 'sync',
                /**
                 * Script source
                 */
                src: `https://tags.tiqcdn.com/utag/aa/${this.profile}/${this.env}/utag.sync.js`,
                /**
                 * Whether or not a script is loaded
                 */
                loaded: false
            },
            {
                /**
                 * Script name
                 */
                name: 'utag',
                /**
                 * Script source
                 */
                src: `https://tags.tiqcdn.com/utag/aa/${this.profile}/${this.env}/utag.js`,
                /**
                 * Whether or not a script is loaded
                 */
                loaded: false
            }
        ];
    }

    /**
     * method returns the scripts inside this.tealiumScripts
     */
    public get scripts(): UtagScript[] {
        return this.tealiumScripts;
    }

    /**
     * Sets the default objects for `utag_cfg_ovrd.noview` and `utag_data`.
     */
    constructor(config?: AnalyticsConfigurationInterface) {
        if (config) {
            this.profile = <string>config.profile || this.profile;
            this.env = <string>config.environment || this.env;
        }

        (<any>window).utag_cfg_ovrd = { noview: true };
        (<any>window).utag_data = {};
    }

    /**
     * embeds utag scrips inside the page
     */
    private getScript(script: UtagScript, callback?: any) {
        if (!script.loaded) {
            const o = { callback: callback || function () { } };
            const scriptElement = (<any>document).createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = script.src;
            if (script.name === 'jquery' && !(<any>window)['jQuery']) {
                (<any>document).getElementsByTagName('head')[0].appendChild(scriptElement);
            } else if (script.name === 'sync') {
                (<any>document).getElementsByTagName('head')[0].appendChild(scriptElement);
            } else if (script.name === 'utag') {
                scriptElement.id = `utag_${script.name}`;
                scriptElement.async = 1;
                scriptElement.charset = 'utf-8';
                (<any>document).getElementsByTagName('body')[0].appendChild(scriptElement);
            }
            script.loaded = true;

            if (typeof o.callback === 'function') {
                if (scriptElement.addEventListener) {
                    scriptElement.addEventListener('load', function () { o.callback(); }, false);
                }
            }
        }
    }

    /**
     * If there is a `window.utag` object, use the `track` method and set data
     * to it, otherwise loop throught the array of scripts and load the utag object
     */
    public track(tealium_event: TealiumEvent, data?: UtagData) {
        if ((<any>window).utag !== undefined) {
            const version = { aileron: { version: this.VERSION } };
            data = Object.assign({}, data, version);
            (<any>window).utag.track(tealium_event, data);
        }

        if ((<any>window).utag === undefined) {
            this.scripts.forEach((script, idx) => {
                this.getScript(script, () => {
                    if (idx === this.scripts.length - 1) {
                        const version = { aileron: { version: this.VERSION } };
                        data = Object.assign({}, data, version);
                        this.track(tealium_event, data);
                    }
                });
            });
        }
    }

    /**
     * [track]{@view Analytics#track} for view
     */
    public view(data?: UtagData) {

        this.env = (data) ? String(data.tealium_environment) : 'prod';
        this.setTealiumScripts(this.profile, this.env);
        this.track('view', data);
    }

    /**
     * [track]{@link Analytics#track} for link
     */
    public link(data?: UtagData) {
        this.setTealiumScripts(this.profile, this.env);
        this.track('link', data);
    }

    /**
     * Called when view or link call is invoked to set the values of tealiumScripts passed}
     */
    public setTealiumScripts(tProfile: string, tEnvironment: string) {
        this.setScripts({ profile: tProfile, environment: tEnvironment });

        if ((<any>window).utag === undefined) {
            this.scripts.forEach((script, idx) => {
                this.getScript(script, () => {
                    console.log((idx+1), ": ", script.loaded);
                });
            });
        }
    }
}
