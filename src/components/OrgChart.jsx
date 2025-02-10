import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PersonModal from './PersonModal';

const OrgChart = ({ data, employeeFilter, directorateFilter, zoom }) => {
  const svgRef = useRef();
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
    '2', '3', '4',  // C-level
    '20', '21', '30', '31', '40', '41',  // Directors and Deputies
    '210', '211', '212',  // Engineering team
    '301',  // Operations specialist
    '310', '311',  // Operations team
    '3111', '3112',  // Operations analysts
    '401',  // Finance analyst
    '410', '411',  // Finance team
    '4111', '4112'  // Finance accountants
  ]));
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalData, setModalData] = useState(null);

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

    // Update chart position directly without state update
    const g = d3.select(svgRef.current).select('g');
    const scale = zoom || 1;
    const containerWidth = svgRef.current.parentElement.clientWidth;
    g.attr('transform', `translate(${containerWidth/2 + newTranslateX}, ${60 + newTranslateY}) scale(${scale})`);
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
      reports
    });
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const containerWidth = svgRef.current.parentElement.clientWidth;
    const containerHeight = svgRef.current.parentElement.clientHeight;
    const nodeWidth = 180;
    const nodeHeight = 80;
    const levelHeight = 150;
    const ceoGap = 50;
    const juniorOffset = levelHeight * 0.5;

    // Clear and setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `-${containerWidth/2} 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#ffffff')
      .html('');

    // Create main group with initial transform
    const g = svg.append('g')
      .attr('transform', `translate(0, 60) scale(${zoom || 1})`);

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
    const root = d3.hierarchy(processedData);

    // Calculate the tree layout with reduced node spacing
    const treeLayout = d3.tree()
      .nodeSize([nodeWidth, levelHeight])
      .separation((a, b) => {
        const hasJunior = a.children?.some(c => c.data.level === 'junior') || 
                         b.children?.some(c => c.data.level === 'junior');
        return a.parent === b.parent ? (hasJunior ? 1.8 : 1.2) : 2;
      });

    treeLayout(root);

    // Calculate tier heights recursively
    const getTierHeights = () => {
      const tierHeights = {
        chief: { min: 180 + ceoGap, max: 180 + ceoGap },
        director: { min: 330 + ceoGap, max: 330 + ceoGap },
        manager: { min: 480 + ceoGap, max: 480 + ceoGap },
        staff: { min: 630 + ceoGap, max: 630 + ceoGap }
      };

      const processNode = (node, depth = 0) => {
        const tier = node.data.tier;
        const level = node.data.level;
        const y = level === 'junior' ? tierHeights[tier].min + juniorOffset : tierHeights[tier].min;
        
        tierHeights[tier].max = Math.max(tierHeights[tier].max, y);

        if (node.children) {
          node.children.forEach(child => processNode(child, depth + 1));
          
          const hasJuniorChildren = node.children.some(c => c.data.level === 'junior');
          if (hasJuniorChildren) {
            tierHeights[tier].max = Math.max(tierHeights[tier].max, y + juniorOffset);
          }
        }
      };

      root.descendants().forEach(node => processNode(node));
      return tierHeights;
    };

    const tierHeights = getTierHeights();

    // Scale node positions
    root.descendants().forEach(d => {
      d.x = d.x;
      d.y = getTierY(d.data.tier, d.data.level, d.data.id, d.parent);
    });

    function getTierY(tier, level, id, parent) {
      if (id === '1') return 0;
      
      if (level === 'junior' && parent && parent.data.level === 'senior') {
        return parent.y + juniorOffset;
      }
      
      let baseY;
      switch(tier) {
        case 'chief': baseY = tierHeights.chief.min; break;
        case 'director': baseY = tierHeights.director.min; break;
        case 'manager': baseY = tierHeights.manager.min; break;
        case 'staff': baseY = tierHeights.staff.min; break;
        default: baseY = tierHeights.chief.min;
      }
      
      return level === 'junior' ? baseY + juniorOffset : baseY;
    }

    // Draw tier backgrounds
    const tiers = [
      { name: 'Chief tier', y: 140 + ceoGap, height: Math.max(levelHeight * 1.5, tierHeights.chief.max - tierHeights.chief.min + levelHeight), color: '#F5F5F5' },
      { name: 'Director tier', y: 290 + ceoGap, height: Math.max(levelHeight * 1.5, tierHeights.director.max - tierHeights.director.min + levelHeight), color: '#F8F8F8' },
      { name: 'Manager/Independent tier', y: 440 + ceoGap, height: Math.max(levelHeight * 1.5, tierHeights.manager.max - tierHeights.manager.min + levelHeight), color: '#FAFAFA' },
      { name: 'Staff tier', y: 590 + ceoGap, height: Math.max(levelHeight * 1.5, tierHeights.staff.max - tierHeights.staff.min + levelHeight), color: '#FCFCFC' }
    ];

    // Add tier backgrounds
    tiers.forEach(tier => {
      const tierGroup = g.append('g')
        .attr('class', 'tier-group');

      tierGroup.append('rect')
        .attr('x', -containerWidth)
        .attr('y', tier.y)
        .attr('width', containerWidth * 2)
        .attr('height', tier.height)
        .attr('fill', tier.color)
        .attr('class', 'tier-background')
        .style('stroke', '#ccc')
        .style('stroke-width', '1');

      tierGroup.append('text')
        .attr('x', -containerWidth + 40)
        .attr('y', tier.y + 30)
        .attr('class', 'tier-label')
        .text(tier.name);
    });

    // Draw links
    const links = g.append('g')
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
      .style('stroke', '#000')
      .style('stroke-width', '1')
      .style('fill', 'none');

    // Create node groups
    const nodes = g.append('g')
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
      .style('fill', d => d.data.level === 'junior' ? '#fff8e1' : '#fff8d6')
      .style('stroke', '#99999935')
      .style('stroke-width', '1')
      .style('cursor', 'pointer')
      .on('click', handleNodeClick);

    // Add node text
    nodes.append('text')
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-name')
      .style('fill', '#000')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.data.name);

    nodes.append('text')
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-title')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text(d => d.data.title);

    nodes.append('text')
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-department')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text(d => d.data.department);

    // Add expand/collapse buttons
    nodes.each(function(d) {
      if (d.data._children || d.data.children) {
        const g = d3.select(this);
        const isExpanded = expandedNodes.has(d.data.id);
        const buttonWidth = 14;
        const buttonHeight = 4;
        const buttonOffset = 5;
        
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
          .style('font-size', '5px')
          .style('font-weight', '500')
          .style('user-select', 'none')
          .text(buttonText)
          .on('click', (event) => toggleNode(d.data.id, event));
      }
    });

    // Apply zoom scale and translation
    const dragState = dragRef.current;
    g.attr('transform', `translate(${dragState.translateX}, ${60 + dragState.translateY}) scale(${zoom || 1})`);

  }, [data, employeeFilter, directorateFilter, zoom, expandedNodes]);

  return (
    <div className="chart-container"
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
        />
      )}
    </div>
  );
};

export default OrgChart;
