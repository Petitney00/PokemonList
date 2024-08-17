document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById('list');
    const filterJapanCheckbox = document.getElementById('filterJapan');
    const filterEuropeCheckbox = document.getElementById('filterEurope');
    const sortButton = document.getElementById('sortButton');
    const sortIcon = document.getElementById('sortIcon');
    const resetButton = document.getElementById('resetButton');
    const resetIcon = document.getElementById('resetIcon');
    const selectedGamesCount = document.getElementById('selectedGamesCount');
    const totalGamesCount = document.getElementById('totalGamesCount');
    const gamesProgressBar = document.getElementById('gamesProgressBar');
    const selectedBoxesCount = document.getElementById('selectedBoxesCount');
    const totalBoxesCount = document.getElementById('totalBoxesCount');
    const boxesProgressBar = document.getElementById('boxesProgressBar');
    let sortAsc = true;
    let jsonOrderAsc = true;
    let data = [];
    let originalOrder = [];
    let checkboxStates = {};
    let textBoxValues = {}; // Agregado para almacenar valores de los campos de texto

    const apiKey = "$2a$10$WlmHc1qlGSf46Jx6M.i5juRkMQUL3mrt8r5xL33k8pX1pgCMOVomO";
    const binId = "66bfc423acd3cb34a87594c1";

    function updateProgress(items) {
        const totalItems = items.length;
        const selectedGames = document.querySelectorAll('.joc:checked').length;
        const selectedBoxes = document.querySelectorAll('.caixa:checked').length;

        selectedGamesCount.textContent = selectedGames;
        totalGamesCount.textContent = totalItems;
        selectedBoxesCount.textContent = selectedBoxes;
        totalBoxesCount.textContent = totalItems;

        const gamesProgressPercent = totalItems > 0 ? (selectedGames / totalItems) * 100 : 0;
        const boxesProgressPercent = totalItems > 0 ? (selectedBoxes / totalItems) * 100 : 0;

        gamesProgressBar.style.width = `${gamesProgressPercent}%`;
        boxesProgressBar.style.width = `${boxesProgressPercent}%`;

        gamesProgressBar.style.visibility = gamesProgressPercent === 0 ? 'hidden' : 'visible';
        boxesProgressBar.style.visibility = boxesProgressPercent === 0 ? 'hidden' : 'visible';
    }

    function saveCheckboxStates() {
        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            checkboxStates[checkbox.dataset.itemId] = checkbox.checked;
        });

        document.querySelectorAll('input[type="text"]').forEach(input => {
            textBoxValues[input.dataset.itemId] = input.value;
        });

        localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
        localStorage.setItem('textBoxValues', JSON.stringify(textBoxValues));
    }

    function loadCheckboxStates() {
        const savedCheckboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
        checkboxStates = savedCheckboxStates;

        const savedTextBoxValues = JSON.parse(localStorage.getItem('textBoxValues')) || {};
        textBoxValues = savedTextBoxValues;

        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            checkbox.checked = checkboxStates[checkbox.dataset.itemId] || false;
        });

        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = textBoxValues[input.dataset.itemId] || '';
        });

        updateProgress(applyFilters(originalOrder)); // Actualizar progreso con los elementos filtrados
    }

    function renderItems(items) {
        list.innerHTML = '';
        items.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'item';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';

            const img = document.createElement('img');
            img.src = item.link;
            img.alt = item.nombre;

            const labelNombre = document.createElement('label');
            labelNombre.textContent = item.nombre;

            const yearLabel = document.createElement('div');
            yearLabel.className = 'year';
            yearLabel.textContent = `Año: ${item.año}`;

            const inputText = document.createElement('input');
            inputText.type = 'text';
            inputText.id = `text-${item.link}`;
            inputText.name = `text-${item.link}`;
            inputText.dataset.itemId = item.link; // Usar el link de la imagen como ID

            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';

            const checkbox1 = document.createElement('input');
            checkbox1.type = 'checkbox';
            checkbox1.className = 'joc';
            checkbox1.dataset.itemId = item.link+"_"+checkbox1.className; // Usar el link de la imagen como ID

            const labelCheckbox1 = document.createElement('label');
            labelCheckbox1.textContent = 'Joc';
            labelCheckbox1.htmlFor = checkbox1.id;

            const checkbox2 = document.createElement('input');
            checkbox2.type = 'checkbox';
            checkbox2.className = 'caixa';
            checkbox2.dataset.itemId = item.link+"_"+checkbox2.className; // Usar el link de la imagen como ID

            const labelCheckbox2 = document.createElement('label');
            labelCheckbox2.textContent = 'Caixa';
            labelCheckbox2.htmlFor = checkbox2.id;

            imgContainer.appendChild(img);
            div.appendChild(imgContainer);
            div.appendChild(labelNombre);
            div.appendChild(yearLabel);
            div.appendChild(inputText);

            checkboxContainer.appendChild(checkbox1);
            checkboxContainer.appendChild(labelCheckbox1);
            checkboxContainer.appendChild(checkbox2);
            checkboxContainer.appendChild(labelCheckbox2);

            div.appendChild(checkboxContainer);
            list.appendChild(div);
        });

        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            checkbox.checked = checkboxStates[checkbox.dataset.itemId] || false;
            checkbox.addEventListener('change', () => {
                saveCheckboxStates();
                updateProgress(applyFilters(originalOrder)); // Actualizar progreso con los elementos filtrados
            });
        });

        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = textBoxValues[input.dataset.itemId] || '';
            input.addEventListener('input', () => {
                saveCheckboxStates();
            });
        });

        updateProgress(items); // Actualizar progreso con los elementos visibles
    }

    function sortItemsByDate(items) {
        return items.sort((a, b) => {
            const dateA = new Date(a.año);
            const dateB = new Date(b.año);
            return sortAsc ? dateA - dateB : dateB - dateA;
        });
    }

    function resetItemsOrder() {
        let orderedItems = jsonOrderAsc ? originalOrder : originalOrder.slice().reverse();
        jsonOrderAsc = !jsonOrderAsc;

        let filteredItems = applyFilters(orderedItems);
        renderItems(filteredItems);
    }

    function applyFilters(items = data) {
        let filteredData = items;

        if (filterJapanCheckbox.checked) {
            filteredData = filteredData.filter(item => item.region !== 'Japón');
        }

        if (filterEuropeCheckbox.checked) {
            filteredData = filteredData.filter(item => item.region !== 'Europa');
        }

        return filteredData;
    }

    function fetchData() {
        return fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            data = jsonData.record;
            originalOrder = [...data];
            let filteredData = applyFilters(data);
            renderItems(filteredData);

            filterJapanCheckbox.addEventListener('change', function () {
                let filteredData = applyFilters(originalOrder);
                renderItems(filteredData);
            });
            filterEuropeCheckbox.addEventListener('change', function () {
                let filteredData = applyFilters(originalOrder);
                renderItems(filteredData);
            });

            sortButton.addEventListener('click', function () {
                sortAsc = !sortAsc;
                let sortedData = sortItemsByDate(applyFilters(originalOrder));
                renderItems(sortedData);
                sortIcon.textContent = sortAsc ? '▲' : '▼';
            });

            resetButton.addEventListener('click', function () {
                resetItemsOrder();
                resetIcon.textContent = jsonOrderAsc ? '▲' : '▼';
            });

            loadCheckboxStates(); // Cargar el estado de los checkboxes y campos de texto después de cargar los datos
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    fetchData();
});
