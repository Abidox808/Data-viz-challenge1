d3.csv("dataset.csv").then(function(data) {
    // Helper to parse dates
    const parseAge = d => {
      const [day, month, year] = d.Age.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      return today.getFullYear() - birthDate.getFullYear();
    };

    // Process data
    data.forEach(d => {
      d.Age = parseAge(d);
      d["Nombre de répitition"] = +d["Nombre de répitition"];
      d["score en mathématiques"] = +d["score en mathématiques"];
      d["score en langue arabe"] = +d["score en langue arabe"];
      d["score en première langue"] = +d["score en première langue"];
    });

    // Age Distribution Chart
    (function() {
      const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
      const chart = d3.select("#age-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const ages = data.map(d => d.Age);
      const bins = d3.histogram().domain([d3.min(ages), d3.max(ages)]).thresholds(10)(ages);

      const x = d3.scaleLinear().domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([height, 0]);

      chart.append("g").call(d3.axisLeft(y).tickFormat(d3.format("d")));
      chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      chart.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Age");

      chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Count");

      const bars = chart.selectAll(".bar")
        .data(bins)
        .enter().append("g");

      bars.append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .attr("fill", "#6fa8dc");

      bars.append("text")
        .attr("x", d => x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
        .attr("y", d => y(d.length) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.length);
    })();

    // School Type Pie Chart
    (function() {
      const width = 300, height = 300, radius = Math.min(width, height) / 2;
      const chart = d3.select("#school-type-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const schoolData = d3.rollups(
        data,
        v => v.length,
        d => d["Interne / Externe"]
      ).map(([key, value]) => ({ type: key, count: value }));

      const color = d3.scaleOrdinal()
        .domain(schoolData.map(d => d.type))
        .range(["#ff7f0e", "#1f77b4"]);

      const pie = d3.pie().value(d => d.count);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      chart.selectAll("path")
        .data(pie(schoolData))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.type))
        .attr("stroke", "white")
        .attr("stroke-width", "2px");

      chart.selectAll("text")
        .data(pie(schoolData))
        .enter().append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.type}: ${d.data.count}`);
    })();

    // Repetition vs Motivation Chart
    (function() {
        const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
        const chart = d3.select("#repetition-motivation-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
        const repetitionData = d3.rollups(
          data,
          v => v.length,
          d => d["Nombre de répitition"]
        ).map(([key, value]) => ({ repetition: key, count: value }));
  
        const x = d3.scaleBand()
          .domain(repetitionData.map(d => d.repetition))
          .range([0, width])
          .padding(0.1);
        const y = d3.scaleLinear()
          .domain([0, d3.max(repetitionData, d => d.count)])
          .range([height, 0]);
  
        chart.append("g").call(d3.axisLeft(y).tickFormat(d3.format("d")));
        chart.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));
  
        chart.append("text")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .attr("text-anchor", "middle")
          .text("Repetition Count");
  
        chart.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -40)
          .attr("text-anchor", "middle")
          .text("Count");
  
        const bars = chart.selectAll(".bar")
          .data(repetitionData)
          .enter().append("g");
  
        bars.append("rect")
          .attr("x", d => x(d.repetition))
          .attr("y", d => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.count))
          .attr("fill", "#ffbb33");
  
        bars.append("text")
          .attr("x", d => x(d.repetition) + x.bandwidth() / 2)
          .attr("y", d => y(d.count) - 5)
          .attr("text-anchor", "middle")
          .text(d => d.count);
      })();
  
      // Academic Performance Overview Chart
      (function() {
        const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
        const chart = d3.select("#academic-performance-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
        const subjects = ["score en mathématiques", "score en langue arabe", "score en première langue"];
        const averages = subjects.map(subject => ({
          subject: subject,
          avgScore: d3.mean(data, d => d[subject])
        }));
  
        const x = d3.scaleBand()
          .domain(averages.map(d => d.subject))
          .range([0, width])
          .padding(0.1);
        const y = d3.scaleLinear()
          .domain([0, 100])
          .range([height, 0]);
  
        chart.append("g").call(d3.axisLeft(y).tickFormat(d => `${d}%`));
        chart.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickFormat(d => d.replace("score en ", "")));
  
        chart.append("text")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .attr("text-anchor", "middle")
          .text("Subjects");
  
        chart.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -40)
          .attr("text-anchor", "middle")
          .text("Average Score (%)");
  
        const bars = chart.selectAll(".bar")
          .data(averages)
          .enter().append("g");
  
        bars.append("rect")
          .attr("x", d => x(d.subject))
          .attr("y", d => y(d.avgScore))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.avgScore))
          .attr("fill", "#82c91e");
  
        bars.append("text")
          .attr("x", d => x(d.subject) + x.bandwidth() / 2)
          .attr("y", d => y(d.avgScore) - 5)
          .attr("text-anchor", "middle")
          .text(d => `${d.avgScore.toFixed(1)}%`);
      })();
  });
