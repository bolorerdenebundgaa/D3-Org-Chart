import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PersonModal from './PersonModal';

const OrgChart = ({ data, employeeFilter, directorateFilter, zoom, viewMode }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
    lastTranslateX: 0,
    lastTranslateY: 0
  });
  const [popup, setPopup] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set([
    '1',  // CEO
    '2', '3', '4',  // C-level (direct reports of CEO)
  ]));
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalData, setModalData] = useState(null);

  const updateTransform = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = dragRef.current;
    svg.selectAll('g.movable-group')
      .attr('transform', `translate(${currentTransform.translateX}, ${currentTransform.translateY}) scale(${zoom || 1})`);
  };

  // Update transform when zoom changes
  useEffect(() => {
    updateTransform();
  }, [zoom]);

  const handleMouseDown = (event) => {
    if (event.button !== 0) return; // Only handle left mouse button
    event.preventDefault(); // Prevent text selection during drag
    
    const dragState = dragRef.current;
    dragState.isDragging = true;
    dragState.startX = event.clientX - dragState.lastTranslateX;
    dragState.startY = event.clientY - dragState.lastTranslateY;
  };

  const handleMouseMove = (event) => {
    const dragState = dragRef.current;
    if (!dragState.isDragging) return;
    event.preventDefault();
    
    const newTranslateX = event.clientX - dragState.startX;
    const newTranslateY = event.clientY - dragState.startY;
    dragState.translateX = newTranslateX;
    dragState.translateY = newTranslateY;

    // Update both chart and background groups
    const svg = d3.select(svgRef.current);
    svg.selectAll('g.movable-group')
      .attr('transform', `translate(${dragState.translateX}, ${dragState.translateY}) scale(${zoom || 1})`);
  };

  const handleMouseUp = (event) => {
    event.preventDefault();
    const dragState = dragRef.current;
    if (!dragState.isDragging) return;
    dragState.isDragging = false;
    dragState.lastTranslateX = dragState.translateX;
    dragState.lastTranslateY = dragState.translateY;
  };

  const toggleNode = (nodeId, event) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const findDirectManagers = (person, root) => {
    const managers = [];
    
    const traverse = (node) => {
      if (!node) return null;
      
      // Check if any of this node's children is our target
      if (node.children) {
        for (const child of node.children) {
          if (child.id === person.id) {
            managers.push(node);
            return true;
          }
        }
        
        // If not found in direct children, search deeper
        for (const child of node.children) {
          if (traverse(child)) {
            return true;
          }
        }
      }
      
      // Also check _children (collapsed nodes)
      if (node._children) {
        for (const child of node._children) {
          if (child.id === person.id) {
            managers.push(node);
            return true;
          }
        }
      }
      
      return false;
    };
    
    traverse(root);
    return managers;
  };

  const findDirectReports = (person) => {
    // Check both expanded and collapsed children
    return [...(person.children || []), ...(person._children || [])];
  };

  const handleNodeClick = (event, d) => {
    if (dragRef.current.isDragging) return;
    event.stopPropagation();
    const person = d.data;
    
    // Find direct managers
    const managers = findDirectManagers(person, data);
    
    // Find direct reports
    const reports = findDirectReports(person);

    setSelectedPerson(person);
    setModalData({
      person,
      managers,
      reports,
      onPersonClick: (newPerson) => {
        // When clicking a person in the modal, find their managers and reports
        const newManagers = findDirectManagers(newPerson, data);
        const newReports = findDirectReports(newPerson);
        return { managers: newManagers, reports: newReports };
      }
    });
  };

  useEffect(() => {
    console.log('OrgChart useEffect running');
    console.log('Data:', data);
    console.log('SVG ref:', svgRef.current);

    if (!svgRef.current || !data) {
      console.log('Missing required refs or data');
      return;
    }

    const containerWidth = svgRef.current.parentElement.clientWidth;
    const containerHeight = svgRef.current.parentElement.clientHeight;
    console.log('Container dimensions:', { width: containerWidth, height: containerHeight });

    const nodeWidth = 180;
    const nodeHeight = 80;
    const levelHeight = 150;
    const ceoGap = 50;
    const juniorOffset = levelHeight * 0.5;

    // Clear and setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background-color', '#ffffff')
      .html('');

    // Create a defs section for clip paths
    const defs = svg.append('defs');

    // Add a clip path to contain the tier backgrounds
    defs.append('clipPath')
      .attr('id', 'chart-area')
      .append('rect')
      .attr('x', -500000)
      .attr('y', 0)
      .attr('width', 1000000)
      .attr('height', 1000);

    // Process data for visualization
    const processData = (node) => {
      if (!node) return null;
      const processed = { ...node };
      if (node.children) {
        if (expandedNodes.has(node.id)) {
          processed.children = node.children.map(child => processData(child));
        } else {
          processed._children = node.children;
          processed.children = null;
        }
      }
      return processed;
    };

    const processedData = processData(data);
    console.log('Processed data:', processedData);

    const root = d3.hierarchy(processedData);
    console.log('Hierarchy root:', root);

    // Calculate the tree layout with fixed dimensions
    const treeLayout = d3.tree()
      .nodeSize([nodeWidth * 1.5, levelHeight])
      .separation((a, b) => {
        const hasJunior = a.children?.some(c => c.data.level === 'junior') || 
                         b.children?.some(c => c.data.level === 'junior');
        return a.parent === b.parent ? (hasJunior ? 1.8 : 1.2) : 2;
      });

    treeLayout(root);
    console.log('Tree layout applied:', root);

    // Calculate chart bounds
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Scale node positions
    root.descendants().forEach(d => {
      if (viewMode === 'vertical') {
        // Swap x and y coordinates for vertical layout
        const temp = d.x;
        d.x = d.y;
        d.y = temp;
      } else {
        d.y = getTierY(d.data.tier, d.data.level, d.data.id, d.parent);
      }

      minX = Math.min(minX, d.x);
      maxX = Math.max(maxX, d.x);
      minY = Math.min(minY, d.y);
      maxY = Math.max(maxY, d.y);
    });

    console.log('Chart bounds:', { minX, maxX, minY, maxY });

    // Calculate chart dimensions
    const chartWidth = maxX - minX + nodeWidth * 2;
    const chartHeight = maxY - minY + nodeHeight * 2;

    // Create main group with initial transform
    const initialTranslateX = containerWidth / 2;
    const initialTranslateY = 100;

    // Create main container group
    const mainGroup = svg.append('g')
      .attr('class', 'movable-group')
      .attr('transform', `translate(${initialTranslateX}, ${initialTranslateY}) scale(${zoom || 1})`);

    // Draw tier backgrounds first
    if (viewMode === 'horizontal') {
      const tiers = [
        { name: 'Chief tier', y: 140 + ceoGap, height: 150 },
        { name: 'Director tier', y: 290 + ceoGap, height: 150 },
        { name: 'Manager/Independent tier', y: 440 + ceoGap, height: 150 },
        { name: 'Staff tier', y: 590 + ceoGap, height: 150 }
      ];

      // Create background group
      const backgroundGroup = mainGroup.append('g')
        .attr('class', 'tier-backgrounds');

      tiers.forEach((tier, index) => {
        // Background rectangle
        const tierGroup = backgroundGroup.append('g')
          .attr('clip-path', 'url(#chart-area)');

        // Add background rectangle
        tierGroup.append('rect')
          .attr('x', -500000)
          .attr('y', tier.y)
          .attr('width', 1000000)
          .attr('height', tier.height)
          .attr('fill', index % 2 === 0 ? 'rgba(248, 249, 250, 0.95)' : 'rgba(240, 241, 242, 0.95)')
          .attr('stroke', 'rgba(0, 0, 0, 0.1)')
          .attr('stroke-width', 1);

        // Add tier label
        tierGroup.append('text')
          .attr('x', -chartWidth / 2 - 150) // Position labels on the left side
          .attr('y', tier.y + tier.height / 2)
          .attr('fill', '#1E4289')
          .attr('font-size', '14px')
          .attr('font-weight', '500')
          .attr('opacity', 0.8)
          .attr('dominant-baseline', 'middle') // Vertically center text
          .text(tier.name);
      });
    }
    
    // Create chart group for nodes and links
    const chartGroup = mainGroup.append('g')
      .attr('class', 'chart-group');

    // Center the root node
    root.descendants().forEach(d => {
      d.x -= (maxX + minX) / 2;
    });

    function getTierY(tier, level, id, parent) {
      if (id === '1') return 0;
      
      if (level === 'junior' && parent && parent.data.level === 'senior') {
        return parent.y + juniorOffset;
      }
      
      let baseY;
      switch(tier) {
        case 'chief': baseY = 180 + ceoGap; break;
        case 'director': baseY = 330 + ceoGap; break;
        case 'manager': baseY = 480 + ceoGap; break;
        case 'staff': baseY = 630 + ceoGap; break;
        default: baseY = 180 + ceoGap;
      }
      
      return level === 'junior' ? baseY + juniorOffset : baseY;
    }

    // Draw links
    const links = chartGroup.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;

        if (viewMode === 'vertical') {
          return d3.linkVertical()({
            source: [sourceX, sourceY],
            target: [targetX, targetY]
          });
        }

        if (d.target.data.level === 'junior') {
          const curve = d3.line().curve(d3.curveBasis);
          const midY = (sourceY + targetY) / 2;
          const controlY1 = sourceY + (targetY - sourceY) * 0.25;
          const controlY2 = sourceY + (targetY - sourceY) * 0.75;
          
          const points = [
            [sourceX, sourceY + nodeHeight/2],
            [sourceX, controlY1],
            [(sourceX + targetX)/2, midY],
            [targetX, controlY2],
            [targetX, targetY - nodeHeight/2]
          ];
          return curve(points);
        }

        const midY = (sourceY + targetY) / 2;
        return `M${sourceX},${sourceY + nodeHeight/2}
                L${sourceX},${midY}
                L${targetX},${midY}
                L${targetX},${targetY - nodeHeight/2}`;
      })
      .style('stroke', '#1E4289')
      .style('stroke-width', '1')
      .style('fill', 'none');

    // Create node groups
    const nodes = chartGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('class', d => `node ${d.data.tier} ${d.data.level}`)
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add node shadows
    nodes.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', -nodeWidth/2 + 1)
      .attr('y', -nodeHeight/2 + 1)
      .attr('rx', 2)
      .style('fill', '#00000012');

    // Add node rectangles with click handler
    nodes.append('rect')
      .attr('class', d => {
        const isHighlighted = 
          d.data.name.toLowerCase().includes(employeeFilter.toLowerCase()) ||
          d.data.department.toLowerCase().includes(directorateFilter.toLowerCase());
        return `node-rect ${d.data.tier} ${d.data.level} ${isHighlighted ? 'highlighted' : ''}`;
      })
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', -nodeWidth/2)
      .attr('y', -nodeHeight/2)
      .attr('rx', 2)
      .style('fill', '#FFFFFF')
      .style('stroke', '#99999935')
      .style('stroke-width', '1')
      .style('cursor', 'pointer')
      .on('click', handleNodeClick);

    // Add node text
    nodes.append('text')
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-name')
      .style('fill', '#1E4289')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.data.name);

    nodes.append('text')
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-title')
      .style('fill', '#1E4289')
      .style('pointer-events', 'none')
      .text(d => d.data.title);

    nodes.append('text')
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-department')
      .style('fill', '#00A0B0')
      .style('pointer-events', 'none')
      .text(d => d.data.department);

    // Add expand/collapse buttons
    nodes.each(function(d) {
      if (d.data._children || d.data.children) {
        const g = d3.select(this);
        const isExpanded = expandedNodes.has(d.data.id);
        const buttonWidth = 30;
        const buttonHeight = 16;
        const buttonOffset = -8;
        
        const buttonGroup = g.append('g')
          .attr('class', 'expand-collapse-group')
          .attr('transform', `translate(0,${nodeHeight/2 + buttonOffset})`);

        // Button shadow
        buttonGroup.append('rect')
          .attr('class', 'toggle-button-shadow')
          .attr('x', -buttonWidth/2 + 0.5)
          .attr('y', 0.5)
          .attr('width', buttonWidth)
          .attr('height', buttonHeight)
          .attr('rx', buttonHeight/2)
          .style('fill', '#00000015');

        // Button background
        buttonGroup.append('rect')
          .attr('class', 'toggle-button')
          .attr('x', -buttonWidth/2)
          .attr('y', 0)
          .attr('width', buttonWidth)
          .attr('height', buttonHeight)
          .attr('rx', buttonHeight/2)
          .style('fill', '#ffffff')
          .style('stroke', '#99999990')
          .style('stroke-width', '0.5')
          .on('click', (event) => toggleNode(d.data.id, event));

        // Button text
        const childCount = d.data._children?.length || d.data.children?.length || 0;
        const buttonText = isExpanded ? '\u2212' : `+${childCount}`;
        
        buttonGroup.append('text')
          .attr('class', 'toggle-text')
          .attr('x', 0)
          .attr('y', buttonHeight/2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('fill', '#666')
          .style('font-size', '11px')
          .style('font-weight', '800')
          .style('user-select', 'none')
          .text(buttonText)
          .on('click', (event) => toggleNode(d.data.id, event));
      }
    });

    console.log('Chart rendering complete');

  }, [data, employeeFilter, directorateFilter, zoom, expandedNodes, viewMode]);

  return (
    <div className="chart-container" ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      <svg ref={svgRef}></svg>
      {popup && (
        <div 
          className="popup"
          style={{ left: popup.x, top: popup.y }}
          onClick={() => setPopup(null)}
        >
          {popup.name}
        </div>
      )}
      {modalData && (
        <PersonModal
          person={modalData.person}
          managers={modalData.managers}
          reports={modalData.reports}
          onClose={() => setModalData(null)}
          onPersonClick={modalData.onPersonClick}
        />
      )}
    </div>
  );
};

export default OrgChart;
