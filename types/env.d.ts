declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    
    // Google AI
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    
    // VAPI
    NEXT_PUBLIC_VAPI_WEB_TOKEN: string;
    NEXT_PUBLIC_VAPI_WORKFLOW_ID: string;
    NEXT_PUBLIC_VAPI_ASSISTANT_ID: string;
    
    // Node environment
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
