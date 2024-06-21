export type Theme = {
    colors:{
        primaryBackground:      string;
        secondaryBackground:    string;
        tertiaryBackground:     string;
        foreground:             string;
        background:             string;
        inputFields:            string;
        textPrimary:            string;
        textSecondary:          string;
        focus:                  string;
        errors:                 string;
        headerBackground:       string;
    };
};

export const theme: Theme = {
    colors: {
        primaryBackground:      '#1F1F28',
        secondaryBackground:    '#353745',
        tertiaryBackground:     '#4A4E69',
        foreground:             '#000000',
        background:             '#FFFFFF',
        inputFields:            '#2E303E',
        textPrimary:            '#E6E6E6',
        textSecondary:          '#B2B2B2',
        focus:                  '#5294E2',
        errors:                 '#FF5555',
        headerBackground:       '#4682B4',
    },
};