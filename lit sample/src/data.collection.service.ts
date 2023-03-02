import {defer, Observable, of} from 'rxjs';
import {customElement} from "lit/decorators.js";
import {LitElement} from "lit";
import {AnalyticsService} from "./analytics.service";
// import {getBearerTokenFromService} from 'apigeeclientlib/getTokenFromAuthService';
import packageJson from './../package.json';
import {AnalyticsConfigurationInterface} from "./analytics-configuration.interface";

/**
 * any object that is passable to the dcfData object
 */
export interface DataCollection {
  /**
 * any object key value that is passable to the dcfData object
 */
  [key: string]: { [key: string]: any };
}
/**
 * attributes that the script tag allows
 */
export interface Script {
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

@customElement('dcf-smartweb-service')
export class DataCollectionService extends LitElement {

  /**
   * tealium environment
   */
  environment = 'prod';

  /**
  * tealium profile
  */
  profile = 'main';

  /**
  * tealium app info
  */
  app = {
    name: '',
    version: '',
    alias: '',
    type: ''
  };

  /**
  * version
  */
  version = {};

  /**
   * analytics version
   */
  analyticsVersion = '1.0.0';

  /**
   * Setting empty dataObject
   */
  dataObject: any = {};

  /**
   * setting empty loyaltyData
   */
  loyaltyData: any = {};

  /**
   * setting empty ipAddress
   */
  ipAddress: any = '';

  /**
   * default rest-api hostname
   */
  restApiHostname = 'https://ba-n-zeaus-digdc-restapi.azurewebsites.net';

  /**
   * default web-component hash version
   */
  webComponentHash = '3e9af65bac83b349761a';

  /**
   * empty dcfObject
   */
  dcfObject: DataCollection | any = {};

  /**
   * utag url
   */
  utagUrl = `https://tags.tiqcdn.com/utag/aa/`;

  /**
   * list of scripts used for analytics
   */
  public scripts: Script[] = [
    {
      name: 'dcfWebComponent',
      src: this.getWebComponentDomain(this.getEnvironment() || ''),
      loaded: false
    }
  ];

  /**
   * constructor for DataCollectionService
   */
  constructor() {
    super();
    this.environment = this.getEnvironment() ||  ''; //executes, return qa

    // web-component fn getWebComponentDomain executes. 


    this.restApiHostname = this.getRestApiHostName(this.environment); //executes returns qa endpoint
    const config = {} as AnalyticsConfigurationInterface
    console.log('inside constructor')

    if (config) {
      console.log('inside config. config is not undefined')
      this.profile = config.profile || this.profile;
      this.environment = config.environment || this.environment;
      this.app.name = config?.app?.name || this.app.name;
      this.app.version = config?.app?.version || this.app.version;
      this.app.alias = config?.app?.alias || this.app.alias;
      this.app.type = config?.app?.type || this.app.type;
      this.version = config.version || this.version;
    }
    console.log('outside config. config is undefined')

  }

  /**
   * invoked when a component is added to the document's DOM
   */
  connectedCallback() {
    console.log('inside connectedCallback. ');
    super.connectedCallback();
  }

  /**
  * get scripts to get the web-component
  */
  private getScript(script: Script, callback?: any) {
    console.log('inside getScript.')
    const o = { callback: callback || function () { } };
    if (!script.loaded) {
      console.log('inside getScript. !script.loaded = true')
      const scriptElement = (<any>document).createElement('script');
      scriptElement.type = 'text/javascript';
      console.log('inside getScript. before dcfWebComponent ')

      if (script.name === 'dcfWebComponent') {
        console.log('inside getScript. script.name === dcfWebComponent is true')
        scriptElement.src = script.src + 'https://qa.cdn.aa.com/dcf/dcf-web-component.3e21a2d7a30223d19a2e.js';
      } else {
        console.log('inside getScript. script.name === dcfWebComponent is false')
        scriptElement.src = script.src;
      }

      script.loaded = true;
      if (typeof o.callback === 'function') {
        console.log('inside getScript. typeof o.callback === function')
        if (scriptElement.addEventListener) {
          console.log('inside getScript. scriptElement.addEventListener')
          scriptElement.addEventListener('load', function () { o.callback(); }, false);
        }
      }
      (<any>document).getElementsByTagName('head')[0].appendChild(scriptElement);
    } else {
      console.log('inside getScript. outer else block')
      o.callback();
    }
  }

  /**
  * chcecking if update call can be made
  */
  private isDcfUpdateDataAvailable() {
    console.log('inside isDcfUpdateDataAvailable')
    return (typeof (<any>window).dcf === 'object' && typeof (<any>window).dcf.updateData === 'function');
  }

  /**
  * Chcecking if init call can be made
  */
  private isDcfInitDataAvailable() {
    console.log('inside isDcfInitDataAvailable')
    return (typeof (<any>window).dcf === 'object' && typeof (<any>window).dcf.initData === 'function');
  }

  /**
  * check to see if getData can be called
  */
  private isDcfGetDataAvailable() {
    console.log('inside isDcfGetDataAvailable')
    return (typeof (<any>window).dcf === 'object' && typeof (<any>window).dcf.getData === 'function');
  }

  /**
  * loading web-component scripts
  */
  public loadScript(data: any, event?: string) {
    console.log('inside loadScript')
    this.scripts.forEach((script) => {
      console.log('inside this.scripts.forEach((script)')
      this.getScript(script, () => {
        console.log('inside this.getScript(script, ()')
        if (event === 'init') {
          console.log('inside init event')
          if (this.isDcfInitDataAvailable()) {
            (<any>window).dcf.initData(data);
            console.log('inside this.isDcfInitDataAvailable() of dcf.initData')
          }
        } else if (event === 'update') {
          console.log('inside this.isDcfInitDataAvailable() event === update')
          if (this.isDcfUpdateDataAvailable()) {
            (<any>window).dcf.updateData(data);
            console.log('inside this.isDcfUpdateDataAvailable. .dcf.updateData ')
          }
        }
      });
    });
  }

  /**
  * getting bearer token per env
  */
//   private getToken(){
//     return getBearerTokenFromService().then((r: any) => {
//       return r;
//     });
//   }

  /**
   * REST API CALL to get schema
   */
  public async getDataCollectionSchema(schemaInput?: string) {
    console.log('getDataCollectionSchema called');
    let url = 'https://ba-n-zeaus-digdc-restapi.azurewebsites.net/getFile';
    if ( schemaInput !== undefined ) {
      url = '';
    }

    // const bearerToken = await this.getToken().then(data => { return data; });

    /**
     * setting akamai pragma header which will be used to get IP address from web-component
     */
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + bearerToken
      }})
    .then(res => {
      console.log('inside return of res');
      if (res.headers.has('x-client-ip')) {
        this.ipAddress = res.headers.get('x-client-ip');
        this.ipAddress = this.ipAddress.split(',')[0];
      }
      console.log('res.json => ', res.json());
      return res.json();
    })
    .then(data => {
        console.log('res.json => ', this.generateInitialData(data));
      return this.generateInitialData(data);
    });
  }

  /**
  * getting initial dcf object
  */
  public get DataCollectionObj() {
    console.log('DataCollectionObj() called ');
    if ((<any>window).dcfData !== undefined) {
      console.log(' <any>window).dcfData !== undefined ');
      this.dcfObject = Object.assign({}, (<any>window).dcfData, this.dcfObject);
    }
    console.log('this.dcfObject ', this.dcfObject);
    return this.dcfObject;
  }

  /**
  * DCF initial call
  */
  public initDataCollectionObj(data: DataCollection) {
    console.log('initDataCollectionObjt ');
    this.loadScript(data, 'init');
  }

  /**
  * getting cached data
  */
  public getDataCollectionObj(): Observable<any> {
    if (this.isDcfGetDataAvailable() && this.getEnvironment() !== 'dev') {
      console.log('this.isDcfGetDataAvailable() && this.getEnvironment() !== ');
      return defer(() => {
        console.log('<any>window).dcf.getData()');
        return (<any>window).dcf.getData();
      });
    } else {
      console.log('else part of getDataCollectionObj)');
      return of(this.DataCollectionObj);
    }
  }

  /**
  * Assigning cached data to local copy of dcfData
  */
  public updateDataCollectionObj(data?: DataCollection) {
    this.dcfObject = data;

    if (this.isDcfUpdateDataAvailable()) {
      (<any>window).dcf.updateData(this.dcfObject);
    } else {
      this.loadScript(this.dcfObject, 'update');
    }
  }

  /**
  * Generating inital dcfData for gloabal attributes call
  */
  async generateInitialData(res: any) {
    console.log('generate inittial data called');
    let data: any = {};
    const accessLevel = await this.getCurrentUserStatus();
    const loyaltySummary = await this.getCurrentUserProfileSummary();
    const utagService =  new AnalyticsService;

    data = res;

    // loads Utag Scripts
    if ((<any>window).utag === undefined) {
      utagService.setTealiumScripts(this.profile, this.environment);
    }

    if (!this.isEmpty(data)) {
      data.digital.device.ip = this.ipAddress;
      data.digital.app.name = this.app.name;
      data.digital.app.alias = this.app.alias;
      data.digital.app.version = this.app.version;
      data.digital.tms.environment = this.environment;
      data.digital.tms.profile = this.profile;

      data.page.pageinfo.primarycategory = this.app.type;

      data.version.components.frontend = this.version;
      data.version.components.analytics = this.analyticsVersion;
      data.version.datacollection.aileroncomponents = '';
      data.version.datacollection.smartwebservice = packageJson.version;

      if (data.webcomponenthash !== undefined) {
        if (
            data.webcomponenthash.match(/^[a-f0-9]{20}$/i) ||
            data.webcomponenthash.match(/^v([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/gm)
        ) {
          this.webComponentHash = data.webcomponenthash;
        }
        delete data.webcomponenthash;
      }
    }

    if (accessLevel === 'GUEST') {
      data.customerloyalty.customer.status = 'Logged_out';
    } else {
    //   if (loyaltySummary.webAnalyticsData !== undefined) {
    //     this.loyaltyData = loyaltySummary.webAnalyticsData;
    //     data.customerloyalty.customer.status = this.getLoyaltyData('login_status');
    //     data.customerloyalty.customer.id = this.getLoyaltyData('loyalty_id');
    //     data.customerloyalty.customer.miles = this.getLoyaltyData('loyalty_balance');
    //     data.customerloyalty.customer.tier = this.getLoyaltyData('loyalty_tier');
    //     data.customerloyalty.codes.gdtreatment = this.getLoyaltyData('gd_treatment_code');
    //     data.customerloyalty.codes.partner = this.getLoyaltyData('partner_code_info');
    //   }
    }
    this.dcfObject = data;

    return data;
  }

  /**
  * Checking for isEmpty
  */
  public isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  /**
  * Getting loyalty data
  */
  private getLoyaltyData(key: any) {
    const item = this.loyaltyData.find((x: any) => x.key === key);
    return item !== undefined ? item.value : '';
  }

  /**
   * Gets the authentication status about the current user.
   */
  async getCurrentUserStatus() {
    console.log('inside getCurrentUserStatus');
    let status= '';
    await fetch('/loyalty/access-level')
        .then(response => {
          console.log('inside /loyalty/access-level');
          return response.json();
        })
        .then(authStatus => {
          if (authStatus.status === '0') {
            console.log('authStatus.status === 0');
            return status = 'GUEST';
          } else if (authStatus.status === '1') {
            console.log('authStatus.status === 1');
            return status = 'UNSECURED';
          } else {
            console.log('authStatus.status else');
            return status = 'SECURE';
          }
        })
        .catch(() => {
          return status = 'GUEST';
        });
    return status;
  }

  /**
   * Gets data about the current user for web analytics
   */
  async getCurrentUserProfileSummary() {
    let memberData;
    if (await this.getCurrentUserStatus() === 'SECURE') {
      console.log('inside getCurrentUserProfileSummary');
      await fetch( '/loyalty/api/web-analytics/summary')
          .then(response => {
            console.log('inside getCurrentUserProfileSummary. response = >', response.json());
            memberData = response.json();
            return memberData;
          })
          .catch((e) => {
            console.error(e);
          });
    }
    console.log('inside getCurrentUserProfileSummary. memberData = >', memberData);
    return memberData;
  }

  /**
   * Retrieves the environment
   */
   private getEnvironment() {
    console.log('inside getEnvironment');
    if ((<any>window).location.hostname === 'localhost') {
      console.log(' getEnvironment return localhost');
      return 'dev';
    } else {
      if ( ((<any>window).location.hostname.indexOf('www') === 0) || ((<any>window).location.hostname.indexOf('stage') === 0) ) {
        console.log(' getEnvironment return prod');
        return 'prod';
      } else {
        console.log(' getEnvironment return qa');
        return 'qa';
      }
    }
  }

  /**
   * Retrieves the version of web-component based on env
   */
  private getWebComponentDomain(env: string) {
    console.log(' getWebComponentDomain');
x
    if (env === 'dev' || env === 'qa') {
        console.log(' getWebComponentDomain. env === dev || env === qa');
      return 'https://qa.cdn.aa.com/dcf';
    } else {
      console.log(' getWebComponentDomain. prod');
      return 'https://cdn.aa.com/dcf';
    }
  }

  /**
   * Retrieves the restapi hostname based on env
   */
  private getRestApiHostName(env: string) {
    console.log(' getRestApiHostName. env => ', env);

    switch(env) {
      case 'stage': return 'https://stage.services.aa.com/dcf/v1' // TODO: test in stage to confirm web-component works with this logic
      case 'qa': return 'https://qa.services.aa.com/dcf/v1'
      case 'dev': return 'https://ba-n-zeaus-digdc-restapi-current.azurewebsites.net/v1'
      default: return 'https://services.aa.com/dcf/v1'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dcf-smartweb-service': DataCollectionService;
  }
}
