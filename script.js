    let data = JSON.parse(localStorage.getItem('marksData')) || [];

    const ctx = document.getElementById('marksChart').getContext('2d');
    let chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Applied Marks',
            data: [],
            borderColor: 'rgba(218, 40, 159, 1)',
            backgroundColor: 'rgba(255, 0, 170, 0.2)',
            fill: true,
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(218, 40, 159, 1)',
            pointBorderColor: 'rgba(218, 40, 159, 1)'
          },
          {
            label: 'Pure Marks',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(0, 152, 255, 0.2)',
            fill: true,
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: 'rgba(54, 162, 235, 1)'
          },
          {
            label: 'Total',
            data: [],
            borderColor: 'rgba(57, 227, 122, 1)',
            backgroundColor: 'rgba(45, 255, 239, 0.2)',
            fill: true,
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(57, 227, 122, 1)',
            pointBorderColor: 'rgba(57, 227, 122, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    function showNotification(message) {
      const toast = document.getElementById('notification');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function formatMark(mark) {
      return Number.isInteger(mark) ? mark : mark.toFixed(2);
    }

    function addEntry() {
      const type = document.getElementById('paperType').value;
      const number = parseInt(document.getElementById('paperNumber').value, 10);
      const marks = parseFloat(document.getElementById('marks').value);

      if (!type || isNaN(number) || number <= 0 || isNaN(marks) || marks < 0 || marks > 100) {
        showNotification('Enter Valid Paper Number and Marks');
        return;
      }

      let entry = data.find(e => e.number === number);
      let isNew = false;
      if (!entry) {
        entry = { number, pure: 0, applied: 0, total: 0 };
        data.push(entry);
        isNew = true;
      }

      if (type === 'Pure') entry.pure = marks;
      else entry.applied = marks;

      entry.total = (entry.pure + entry.applied) / 2;
      entry.name = `Paper ${entry.number}`;

      localStorage.setItem('marksData', JSON.stringify(data));
      updateChart();
      updateMarksTable(isNew, number);

      document.getElementById('paperNumber').value = '';
      document.getElementById('marks').value = '';
    }

    function deleteEntry(number, btn) {
      btn.classList.add('btn-clicked');

      const tr = btn.closest('tr');
      if (!tr) {
        performDelete(number);
        return;
      }

      tr.classList.add('fade-scale-out');

      setTimeout(() => {
        performDelete(number);
      }, 300);
    }

    function performDelete(number) {
      data = data.filter(e => e.number !== number);
      localStorage.setItem('marksData', JSON.stringify(data));
      updateChart();
      updateMarksTable();
      showNotification(`Paper ${number} erased`);
    }

    function updateMarksTable(isNew = false, addedNumber = null) {
      const tbody = document.querySelector('#marksTable tbody');
      tbody.innerHTML = '';

      data.sort((a, b) => a.number - b.number);
      data.forEach(entry => {
        const tr = document.createElement('tr');

        const tdPaper = document.createElement('td');
        tdPaper.textContent = entry.name;
        tdPaper.style.position = 'relative';

        const eraseBtn = document.createElement('button');
        eraseBtn.className = 'erase-btn';
        eraseBtn.title = `Erase ${entry.name}`;
        eraseBtn.textContent = '×';
        eraseBtn.onclick = () => deleteEntry(entry.number, eraseBtn);
        tdPaper.appendChild(eraseBtn);

        const tdPure = document.createElement('td');
        tdPure.textContent = formatMark(entry.pure);

        const tdApplied = document.createElement('td');
        tdApplied.textContent = formatMark(entry.applied);

        const tdTotal = document.createElement('td');
        tdTotal.textContent = formatMark(entry.total);

        const tdGrade = document.createElement('td');
        const m = entry.total;
        if (m < 35) tdGrade.className = 'fail', tdGrade.textContent = 'F';
        else if (m < 50) tdGrade.className = 'spass', tdGrade.textContent = 'S';
        else if (m < 65) tdGrade.className = 'cpass', tdGrade.textContent = 'C';
        else if (m < 75) tdGrade.className = 'bpass', tdGrade.textContent = 'B';
        else tdGrade.className = 'apass', tdGrade.textContent = 'A';

        tr.appendChild(tdPaper);
        tr.appendChild(tdPure);
        tr.appendChild(tdApplied);
        tr.appendChild(tdTotal);
        tr.appendChild(tdGrade);

        // If this row is newly added, animate it
        if (isNew && entry.number === addedNumber) {
          tr.classList.add('fade-scale-in');
        }

        tbody.appendChild(tr);
      });
    }

    document.getElementById('togglePure').addEventListener('change', function () {
      chart.data.datasets[1].hidden = !this.checked;
      chart.update();
    });
    document.getElementById('toggleApplied').addEventListener('change', function () {
      chart.data.datasets[0].hidden = !this.checked;
      chart.update();
    });
    document.getElementById('toggleTotal').addEventListener('change', function () {
      chart.data.datasets[2].hidden = !this.checked;
      chart.update();
    });

    function updateChart() {
      data.sort((a, b) => a.number - b.number);
      chart.data.labels = data.map(d => d.name);
      chart.data.datasets[0].data = data.map(d => d.applied);
      chart.data.datasets[1].data = data.map(d => d.pure);
      chart.data.datasets[2].data = data.map(d => d.total);
      chart.update();
    }

    // Init on load
    updateChart();
    updateMarksTable();
function deleteRow(row) {
  // Add a class that triggers CSS transition on height, padding, margin
  row.classList.add('row-shrink');

  // Listen for transition end to actually remove the row
  row.addEventListener('transitionend', () => {
    row.remove();
    // Also update your chart or table data as needed here
    updateChart();
    updateMarksTable();
  }, { once: true });
}

