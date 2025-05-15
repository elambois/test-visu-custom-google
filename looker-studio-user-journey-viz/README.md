# Looker Studio User Journey Visualization

This project provides a custom visualization for representing user journeys through pages in Looker Studio. The visualization utilizes D3.js to create an interactive graph that displays the connections between different pages based on user interactions.

## Project Structure

```
looker-studio-user-journey-viz
├── src
│   ├── main.js        # Main logic for the custom visualization
│   ├── styles.css     # Styles for the visualization
│   └── index.html     # Entry point for the visualization
├── package.json       # Configuration file for npm
├── README.md          # Documentation for the project
└── .gitignore         # Files and directories to be ignored by Git
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd looker-studio-user-journey-viz
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Open `src/index.html` in a web browser to view the visualization.
2. Ensure that you have the necessary data structure in Looker Studio to feed into the visualization.

## Customization

- Modify `src/styles.css` to change the appearance of the nodes, links, and labels in the graph.
- Update `src/main.js` to adjust the logic for how data is processed and visualized.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.