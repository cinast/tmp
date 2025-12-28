let Package: {
    json: PackageJSON;
    panels: [];
    enabled: true;
    invalid: false;
    path: "";
    module: {
        load: [Function];
        unload: [Function];
        methods: { String: Function };
    };
    [K: string]: any;
};
