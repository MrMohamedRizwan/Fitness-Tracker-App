module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'src/app/hello-world.spec.ts'
        ],
        preprocessors: {
            'src/app/hello-world.spec.ts': ['typescript']
        },
        reporters: ['progress'],
        browsers: ['Chrome'],
        singleRun: true,
        typescriptPreprocessor: {
            options: {
                sourceMap: true
            }
        }
    });
};