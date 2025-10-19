$(document).ready(function () {

    const $activityInput = $('.taskTable input[type="text"]').eq(0);
    const $subjectSelect = $('.taskTable select');
    const $subjectNameInput = $('.taskTable input[type="text"]').eq(1);
    const $dateInput = $('.taskTable input[type="date"]');
    const $tbody = $('tbody');

    // ✅ Hide Subject Name initially if not "others"
    if ($subjectSelect.val() !== "others") {
        $subjectNameInput.hide().val("");
    }

    $subjectSelect.on("change", function () {
        if ($(this).val() === "others") {
            $subjectNameInput.show();
        } else {
            $subjectNameInput.hide().val("");
        }
    });

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    let history = JSON.parse(localStorage.getItem('history') || '[]');

    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('history', JSON.stringify(history));
    }

    // Status color logic
    function getStatusColor(status, deadline) {
        const today = new Date();
        const dueDate = new Date(deadline);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        if (status === "Done") return "limegreen";
        if (dueDate.getTime() < today.getTime()) return "red"; // past
        if (dueDate.getTime() === today.getTime()) return "yellow"; // today
        return "#cccccc"; // future
    }

    function renderTasks() {
        $tbody.empty();
        tasks.forEach((task, i) => {
            const statusColor = getStatusColor(task.status, task.deadline);
            const $row = $(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${task.activity}</td>
                    <td>${task.subject}</td>
                    <td>${task.deadline}</td>
                    <td style="color:${statusColor}; font-weight:bold;">${task.status}</td>
                    <td>
                        <button class="doneBtn">Done</button>
                        <button class="undoBtn">Undo</button>
                        <button class="deleteBtn">Delete</button>
                    </td>
                </tr>
            `);

            $row.find(".doneBtn").click(() => markDone(i));
            $row.find(".undoBtn").click(() => undoTask(i));
            $row.find(".deleteBtn").click(() => deleteTask(i));

            // Button styles
            $row.find(".doneBtn").css({
                background: '#ff69b4', color: 'white', padding: '5px 10px',
                border: '1px solid #ff69b4', borderRadius: '15px',
                cursor: 'pointer', fontSize: '0.8rem',
                transition: 'background 0.2s, transform 0.2s',
            }).hover(
                function () { $(this).css({ background: '#ff85c1', transform: 'scale(1.05)' }); },
                function () { $(this).css({ background: '#ff69b4', transform: 'scale(1)' }); }
            );

            $row.find(".undoBtn").css({
                background: 'transparent', color: '#ffb6e0', padding: '5px 10px',
                border: '1px solid #ffb6e0', borderRadius: '15px',
                cursor: 'pointer', fontSize: '0.8rem',
                transition: 'background 0.2s, color 0.2s, transform 0.2s',
            }).hover(
                function () { $(this).css({ background: '#ffb6e0', color: '#800080', transform: 'scale(1.05)' }); },
                function () { $(this).css({ background: 'transparent', color: '#ffb6e0', transform: 'scale(1)' }); }
            );

            $row.find(".deleteBtn").css({
                background: '#dc3545', color: 'white', padding: '5px 10px',
                border: '1px solid #dc3545', borderRadius: '15px',
                cursor: 'pointer', fontSize: '0.8rem',
                transition: 'background 0.2s, transform 0.2s',
            }).hover(
                function () { $(this).css({ background: '#c82333', transform: 'scale(1.05)' }); },
                function () { $(this).css({ background: '#dc3545', transform: 'scale(1)' }); }
            );

            $tbody.append($row);
        });
    }

    // ➕ Add task
    window.add = function () {
        const activity = $activityInput.val().trim();
        const subject = $subjectSelect.val() === "others"
            ? $subjectNameInput.val().trim()
            : $subjectSelect.find(":selected").text();
        const deadline = $dateInput.val();

        if (!activity || !deadline) return alert("Please fill in all required fields.");

        tasks.push({ activity, subject, deadline, status: "Ongoing" });
        saveData();
        renderTasks();

        $activityInput.val("");
        $subjectSelect.val("select");
        $subjectNameInput.val("").hide();
        $dateInput.val("");
    };

    // ✅ Mark as Done
    function markDone(index) {
        tasks[index].status = "Done";
        history.push(tasks[index]);
        tasks.splice(index, 1);
        saveData();
        renderTasks();
    }

    // ✅ Undo
    function undoTask(index) {
        tasks[index].status = "Ongoing";
        saveData();
        renderTasks();
    }

    // ✅ Delete with fade-out
    function deleteTask(index) {
        const $row = $tbody.find("tr").eq(index);
        $row.fadeOut(200, function () {
            tasks.splice(index, 1);
            saveData();
            renderTasks();
        });
    }

    // 🔄 Initial render
    renderTasks();

    // 🔔 Native Android Notifications via bridge
    function checkDeadlines() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        tasks.forEach(task => {
            const deadlineDate = new Date(task.deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let message = "";
            if (diffDays === 0) {
                message = `Task "${task.activity}" is due today!`;
            } else if (diffDays === 1) {
                message = `Task "${task.activity}" is due tomorrow!`;
            }

            if (message && window.AndroidBridge) {
                AndroidBridge.notify("SmartList MVP", message);
            }
        });
    }

    // Initial notification check
    checkDeadlines();
    setInterval(checkDeadlines, 3600000);
});