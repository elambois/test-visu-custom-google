if (typeof dscc === 'undefined') {
  var dscc = {
    subscribeToData: (callback) => {
      const mockData = {
        tables: {
          DEFAULT: [
            { from_page: 'Home', to_page: 'Range', event: 'Start configuration' },
            { from_page: 'Range', to_page: 'Range_Color', event: 'Choose color' },
            { from_page: 'Range_Color', to_page: 'Range_Model', event: 'Select model' },
            { from_page: 'Range_Model', to_page: 'Dimension', event: 'Confirm range' },

            { from_page: 'Dimension', to_page: 'Set_Height', event: 'Adjust height' },
            { from_page: 'Set_Height', to_page: 'Set_Width', event: 'Adjust width' },
            { from_page: 'Set_Width', to_page: 'Set_Depth', event: 'Adjust depth' },
            { from_page: 'Set_Depth', to_page: 'Check_Compatibility', event: 'Check compatibility' },
            { from_page: 'Check_Compatibility', to_page: 'Accessoires', event: 'Proceed to accessories' },

            { from_page: 'Accessoires', to_page: 'Add_Handles', event: 'Select handles' },
            { from_page: 'Add_Handles', to_page: 'Add_Lighting', event: 'Add lighting system' },
            { from_page: 'Add_Lighting', to_page: 'Add_Sensors', event: 'Add smart sensors' },
            { from_page: 'Add_Sensors', to_page: 'Accessory_Review', event: 'Review accessories' },
            { from_page: 'Accessory_Review', to_page: 'Récapitulatif', event: 'Finish accessories' },

            { from_page: 'Récapitulatif', to_page: 'Review_Details', event: 'View full summary' },
            { from_page: 'Review_Details', to_page: 'Edit_Dimensions', event: 'Edit dimensions' },
            { from_page: 'Edit_Dimensions', to_page: 'Set_Width', event: 'Refine width' },
            { from_page: 'Set_Width', to_page: 'Check_Compatibility', event: 'Recheck compatibility' },
            { from_page: 'Check_Compatibility', to_page: 'Accessory_Review', event: 'Reconfirm accessories' },
            { from_page: 'Accessory_Review', to_page: 'Récapitulatif', event: 'Back to summary' },

            { from_page: 'Récapitulatif', to_page: 'Add_Comment', event: 'Add client note' },
            { from_page: 'Add_Comment', to_page: 'Validation', event: 'Send to Odoo' }
          ],
        },
      };
      callback(mockData);
    },
    getWidth: () => window.innerWidth,
    getHeight: () => window.innerHeight,
  };
}

dscc.subscribeToData(drawViz, { transform: dscc.tableTransform });

function drawViz(dataResponse) {
  const data = dataResponse.tables.DEFAULT;

  // Créer des nœuds avec des identifiants uniques basés sur leur position dans le parcours
  const nodes = [];
  const links = [];
  const nodeMap = new Map(); // Pour suivre les nœuds uniques

  data.forEach((d, index) => {
    // Créer un identifiant unique pour chaque occurrence de page
    const sourceKey = `${d.from_page}-${index}`;
    const targetKey = `${d.to_page}-${index + 1}`;

    // Ajouter le nœud source s'il n'existe pas
    if (!nodeMap.has(sourceKey)) {
      nodeMap.set(sourceKey, { id: sourceKey, name: d.from_page });
      nodes.push({ id: sourceKey, name: d.from_page });
    }

    // Ajouter le nœud cible s'il n'existe pas
    if (!nodeMap.has(targetKey)) {
      nodeMap.set(targetKey, { id: targetKey, name: d.to_page });
      nodes.push({ id: targetKey, name: d.to_page });
    }

    // Ajouter le lien entre les nœuds
    links.push({
      source: sourceKey,
      target: targetKey,
      event: d.event,
    });
  });

  d3.select('#graph').html(''); // Effacer le graphique précédent

  const width = dscc.getWidth();
  const height = dscc.getHeight();

  const svg = d3.select('#graph')
    .append('svg')
    .attr('width', Math.max(width, nodes.length * 50))
    .attr('height', Math.max(height, nodes.length * 50));

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(10) // Distance entre les nœuds connectés
    )
    .force('charge', d3.forceManyBody()
      .strength(-20) // Réduire la répulsion pour éviter les chevauchements
    )
    .force('x', d3.forceX((d, i) => {
      // Calculer la position horizontale en fonction du segment
      const segmentSize = Math.ceil(nodes.length / 3); // Diviser les nœuds en 3 segments
      const stepX = width / segmentSize; // Espacement horizontal dans chaque segment

      if (i < segmentSize) {
        // Segment 1 : De gauche à droite
        return stepX * i;
      } else if (i < 2 * segmentSize) {
        // Segment 2 : De droite à gauche
        return width - stepX * (i - segmentSize);
      } else {
        // Segment 3 : De gauche à droite
        return stepX * (i - 2 * segmentSize);
      }
    }).strength(1)) // Force forte pour aligner les nœuds horizontalement
    .force('y', d3.forceY((d, i) => {
      // Calculer la position verticale en fonction du segment
      const segmentSize = Math.ceil(nodes.length / 3); // Diviser les nœuds en 3 segments
      const stepY = height / 3; // Espacement vertical entre les segments

      if (i < segmentSize) {
        // Segment 1 : En haut
        return stepY * 0;
      } else if (i < 2 * segmentSize) {
        // Segment 2 : Au milieu
        return stepY * 1;
      } else {
        // Segment 3 : En bas
        return stepY * 2;
      }
    }).strength(1)) // Force forte pour aligner les nœuds verticalement
    .force('center', d3.forceCenter(width / 2, height / 2)); // Centrer le graphe

  // Dessiner les liens
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('class', 'link');

  // Dessiner les nœuds
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('r', 10)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Ajouter des étiquettes aux nœuds
  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .text(d => d.name) // Afficher le nom de la page
    .attr('font-size', 12)
    .attr('dx', 12)
    .attr('dy', 4);

  // Ajouter des étiquettes aux liens
  const linkLabels = svg.append('g')
    .selectAll('text')
    .data(links)
    .enter().append('text')
    .text(d => d.event)
    .attr('font-size', 10);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    linkLabels
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    label
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}