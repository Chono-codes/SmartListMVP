$(document).ready(function () {
    const $tbody = $('tbody');

    // Load history and tasks from LocalStorage
    let historyData = JSON.parse(localStorage.getItem('history') || '[]');
    let tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');

    function saveData() {
        localStorage.setItem('history', JSON.stringify(historyData));
        localStorage.setItem('tasks', JSON.stringify(tasksData));
    }

    function renderHistory() {
        $tbody.empty();

        if (historyData.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">No history available</td></tr>');
            return;
        }

        historyData.forEach((task, index) => {
            const $row = $(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${task.activity}</td>
                    <td>${task.subject}</td>
                    <td>${task.deadline}</td>
                    <td>
                        <button class="undoBtn">Undo</button>
                        <button class="deleteBtn">Delete</button>
                    </td>
                </tr>
            `);

            // Style buttons
            $row.find(".undoBtn").css({
                background: '#ffc107',
                color: 'white',
                marginRight: '5px',
                padding: '5px 10px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.2s',
            }).hover(
                function () { $(this).css({ background: '#ffcd38', transform: 'scale(1.05)' }); },
                function () { $(this).css({ background: '#ffc107', transform: 'scale(1)' }); }
            );

            $row.find(".deleteBtn").css({
                background: '#dc3545',
                color: 'white',
                padding: '5px 10px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.2s',
            }).hover(
                function () { $(this).css({ background: '#c82333', transform: 'scale(1.05)' }); },
                function () { $(this).css({ background: '#dc3545', transform: 'scale(1)' }); }
            );

            // ✅ Instant Undo with fade animation
            $row.find(".undoBtn").click(() => {
                const $currentRow = $tbody.find("tr").eq(index);
                $currentRow.fadeOut(200, function () {
                    tasksData.push(historyData[index]);
                    historyData.splice(index, 1);
                    saveData();
                    renderHistory();
                });
            });

            // ✅ Instant Delete with fade animation
            $row.find(".deleteBtn").click(() => {
                const $currentRow = $tbody.find("tr").eq(index);
                $currentRow.fadeOut(200, function () {
                    historyData.splice(index, 1);
                    saveData();
                    renderHistory();
                });
            });

            $tbody.append($row);
        });
    }

    // Initial render
    renderHistory();
});