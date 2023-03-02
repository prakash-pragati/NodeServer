/**
 * Configuration for [Analytics]{@link Analytics}
 */
 export interface AnalyticsConfigurationInterface {
    /**
     * Profile that is to be used by a team
     */
    profile?: string;
  
    /**
     * The script environment to be loaded
     */
    environment?: string;
  
    /**
     * The script app variables to be loaded
     */
     app?: {
      name?: any;
      version?: any;
      alias?: any;
      type?: any;
    };
  
    /**
     * The script version to be loaded
     */
    version?: {};
  }
  