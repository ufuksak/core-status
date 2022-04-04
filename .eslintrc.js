module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "root": true,
  "extends": [
    "eslint:recommended",
    "prettier",
    "prettier/react"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "prettier/prettier": 1,
    "react/jsx-filename-extension": [
      0,
      { "extensions": [".js", ".jsx", ".ts", ".tsx"] }
    ],
    "import/no-dynamic-require": 0,
    "global-require": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,
    "react/jsx-curly-brace-presence": 0,
    "react/jsx-props-no-spreading": 0,
    "react/no-array-index-key": 0,
    "arrow-body-style": 0,
    "object-curly-newline": 0,
    "react/no-unescaped-entities": 0,
    "consistent-return": 0,
    "jsx-a11y/label-has-associated-control": [
      2,
      {
        "labelComponents": ["CustomInputLabel"],
        "labelAttributes": ["label"],
        "controlComponents": ["CustomInput"],
        "depth": 3
      }
    ],
    "jsx-a11y/no-noninteractive-element-interactions": [
      "error",
      {
        "handlers": [
          "onClick",
          "onMouseDown",
          "onMouseUp",
          "onKeyPress",
          "onKeyDown",
          "onKeyUp"
        ]
      }
    ]
  },
  "overrides": [
    {
      "files": ["**/*.test.js", "**/*.test.jsx"],
      "env": {
        "jest": true
      }
    }
  ]
}
