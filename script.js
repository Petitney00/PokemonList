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
    let sortAsc = true; // Indica si se debe ordenar ascendente o descendente
    let jsonOrderAsc = true; // Indica si el orden del JSON debe ser ascendente o descendente
    let data = [];
    let originalOrder = []; // Para almacenar el orden original
    
    const apiKey = "$2a$10$WlmHc1qlGSf46Jx6M.i5juRkMQUL3mrt8r5xL33k8pX1pgCMOVomO"; // Reemplaza con tu API Key de JSONbin.io
    const binId = "66bfc423acd3cb34a87594c1"; // Reemplaza con el ID de tu bin de JSONbin.io

    function updateProgress() {
        const totalItems = data.length;
        const selectedGames = document.querySelectorAll('.joc:checked').length;
        const selectedBoxes = document.querySelectorAll('.caixa:checked').length;

        selectedGamesCount.textContent = selectedGames;
        totalGamesCount.textContent = totalItems;
        selectedBoxesCount.textContent = selectedBoxes;
        totalBoxesCount.textContent = totalItems;

        const gamesProgressPercent = (selectedGames / totalItems) * 100;
        const boxesProgressPercent = (selectedBoxes / totalItems) * 100;

        gamesProgressBar.style.width = `${gamesProgressPercent}%`;
        boxesProgressBar.style.width = `${boxesProgressPercent}%`;

        // Ocultar la barra si está en 0%
        gamesProgressBar.style.visibility = gamesProgressPercent === 0 ? 'hidden' : 'visible';
        boxesProgressBar.style.visibility = boxesProgressPercent === 0 ? 'hidden' : 'visible';
    }

    function saveCheckboxStates() {
        const checkboxStates = {};
        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            checkboxStates[checkbox.id] = checkbox.checked;
        });
        localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
    }

    function loadCheckboxStates() {
        const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            if (checkboxStates[checkbox.id] !== undefined) {
                checkbox.checked = checkboxStates[checkbox.id];
            }
        });
        updateProgress(); // Actualiza el progreso después de restaurar el estado
    }

    function renderItems(items) {
        list.innerHTML = '';
        items.forEach((item, index) => {
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
            inputText.id = `text${index + 1}`;
            inputText.name = `text${index + 1}`;

            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';

            const checkbox1 = document.createElement('input');
            checkbox1.type = 'checkbox';
            checkbox1.id = `checkbox${index + 1}-1`;
            checkbox1.name = `checkbox${index + 1}-1`;
            checkbox1.className = 'joc';

            const labelCheckbox1 = document.createElement('label');
            labelCheckbox1.textContent = 'Joc';
            labelCheckbox1.htmlFor = checkbox1.id;

            const checkbox2 = document.createElement('input');
            checkbox2.type = 'checkbox';
            checkbox2.id = `checkbox${index + 1}-2`;
            checkbox2.name = `checkbox${index + 1}-2`;
            checkbox2.className = 'caixa';

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

        // Actualizar barra de progreso después de renderizar
        updateProgress();

        // Añadir eventos a los checkboxes para actualizar la barra de progreso al hacer clic
        document.querySelectorAll('.joc, .caixa').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                saveCheckboxStates();
                updateProgress();
            });
        });
    }

    function sortItemsByDate(items) {
        return items.sort((a, b) => {
            const dateA = new Date(a.año);
            const dateB = new Date(b.año);
            return sortAsc ? dateA - dateB : dateB - dateA;
        });
    }

    function resetItemsOrder() {
        // Alterna entre el orden original y el orden inverso del JSON
        let orderedItems = jsonOrderAsc ? originalOrder : originalOrder.slice().reverse();
        jsonOrderAsc = !jsonOrderAsc;

        // Aplicar filtros sobre el ordenado
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
            data = jsonData.record; // Acceder al contenido del bin
            originalOrder = [...data]; // Guardar el orden original del JSON
            let filteredData = applyFilters(data);
            renderItems(filteredData); // Inicial render

            // Filtro por región
            filterJapanCheckbox.addEventListener('change', function () {
                renderItems(applyFilters(originalOrder));
            });
            filterEuropeCheckbox.addEventListener('change', function () {
                renderItems(applyFilters(originalOrder));
            });

            // Ordenar por fecha
            sortButton.addEventListener('click', function () {
                sortAsc = !sortAsc;
                renderItems(sortItemsByDate(applyFilters(originalOrder)));
                sortIcon.textContent = sortAsc ? '▲' : '▼';
            });

            // Resetear a orden del JSON (y alternar entre ascendente/descendente)
            resetButton.addEventListener('click', function () {
                resetItemsOrder();
                resetIcon.textContent = jsonOrderAsc ? '▲' : '▼';
            });

            loadCheckboxStates(); // Cargar el estado de los checkboxes después de cargar los datos
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    fetchData();
});
