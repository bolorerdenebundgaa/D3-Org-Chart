# Interactive Organization Chart with D3 and React

An interactive organization chart built with D3.js and React that features drag-and-drop functionality, zoom controls, and expandable/collapsible nodes. View the [live demo](https://bolor.me/D3OrgChart/index.html).


## Features

- 🎯 Interactive drag-and-drop functionality
- 🔍 Zoom in/out controls
- 📊 Expandable/collapsible nodes
- 🎨 Color-coded hierarchy levels
- 🖼️ Avatar support
- 🔎 Search functionality
- 📱 Responsive design

## Quick Setup (No Installation Required)

If you just want to use the built files:

1. Download the contents of the `dist` folder from the demo URL
2. Copy all files to your web server
3. Access through your web server (e.g., `https://yourserver.com/index.html`)

That's it! No build process or installation required.

Note: Make sure all files from the dist folder are in the same directory on your web server.

## Developer Installation

If you want to customize or develop the project:

1. Clone the repository:
```bash
gh repo clone bolorerdenebundgaa/D3-Org-Chart
cd D3-Org-Chart
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

The built files will be in the `dist` folder.

## Customization

### Color Scheme

The color scheme is easily customizable through the `colors` object in `src/components/OrgChart.jsx`:

```javascript
const colors = {
  // Node background colors - 5 level gradation
  nodeColors: {
    ceo: '#A3C5CB',      // Base color
    tier1: '#B5D1D6',    // 15% lighter
    tier2: '#C7DEE1',    // 30% lighter
    tier3: '#D9EAEC',    // 45% lighter
    tier4: '#EBF6F7'     // 60% lighter
  },
  // Button colors
  button: {
    background: '#ffffff',
    text: '#666666'
  },
  // Text colors
  text: {
    primary: '#1E4289',
    secondary: '#00A0B0'
  }
};
```

### Data Structure

Update `src/data.js` to modify the organization structure. Each node should follow this format:

```javascript
{
  id: '1',
  name: "Employee Name",
  title: "Job Title",
  department: "Department",
  tier: "chief|director|manager|staff",
  level: "senior|junior",
  avatar: "/path/to/avatar.png",
  children: [] // Array of child nodes
}
```

### Avatar Images

1. Place your avatar images in the `public` folder
2. Reference them in the data.js file using absolute paths (e.g., "/avatar.png")
3. Make sure the images are square (e.g., 200x200 pixels) for best results

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use in your projects

## Credits

Built with:
- React
- D3.js
- Vite
