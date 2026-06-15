interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_API_URL: string;
    readonly VITE_APP_ENV: "development" | "production";
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
