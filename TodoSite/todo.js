 const taskModal = document.getElementById('taskModal');
        const confirmModal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmAction = document.getElementById('confirmAction');
        const cancelConfirm = document.getElementById('cancelConfirm');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskPriority = document.getElementById('taskPriority');
        const taskDue = document.getElementById('taskDueDate');
        const editingIndex = document.getElementById('editingIndex');
        const toast = document.getElementById('toast');

        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        let confirmCallback = () => { };

        function openModal(index = null) {
            taskModal.classList.remove('hidden');
            if (index !== null) {
                const task = tasks[index];
                editingIndex.value = index;
                taskTitle.value = task.title;
                taskDescription.value = task.description;
                taskPriority.value = task.priority;
                taskDue.value = task.due;
                document.getElementById('modalTitle').textContent = 'Edit Task';
            } else {
                editingIndex.value = '';
                taskTitle.value = '';
                taskDescription.value = '';
                taskPriority.value = 'low';
                taskDue.value = '';
                document.getElementById('modalTitle').textContent = 'Add Task';
            }
        }

        function closeModal() {
            taskModal.classList.add('hidden');
        }

        function showConfirm(message, callback) {
            confirmMessage.textContent = message;
            confirmModal.classList.remove('hidden');
            confirmCallback = callback;
        }

        function hideConfirm() {
            confirmModal.classList.add('hidden');
        }

        function saveTask() {
            const task = {
                title: taskTitle.value,
                description: taskDescription.value,
                priority: taskPriority.value,
                due: taskDue.value,
                completed: false
            };
            if (editingIndex.value) {
                tasks[editingIndex.value] = task;
                showToast('Task updated!');
            } else {
                tasks.push(task);
                showToast('Task added!');
            }
            closeModal();
            saveToLocal();
            renderTasks();
        }

        function renderTasks() {
            const allList = document.getElementById('allTasks');
            const pendingList = document.getElementById('pendingTasks');
            const completedList = document.getElementById('completedTasks');

            allList.innerHTML = pendingList.innerHTML = completedList.innerHTML = '';

            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'p-3 bg-gray-100 rounded-md flex flex-col sm:flex-row justify-between gap-3 overflow-hidden';

                const content = document.createElement('div');
                content.className = 'flex-1 break-words';
                content.innerHTML = `
            <strong class="block text-base font-semibold break-words">${task.title}</strong>
            <div class="text-sm text-gray-700 whitespace-pre-wrap break-words">${task.description}</div>
            <span class="inline-block mt-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}">
                ${task.priority}
            </span>
            <div class="text-xs text-gray-500 mt-1">Due: ${task.due || 'None'}</div>`;

                const actions = document.createElement('div');
                actions.className = 'flex flex-wrap sm:flex-col gap-2 justify-end shrink-0';
                actions.innerHTML = `
            <button onclick="confirmToggle(${index})" class="text-sm px-3 py-1 rounded bg-green-500 text-white">
                ${task.completed ? 'Undo' : 'Done'}
            </button>
            <button onclick="openModal(${index})" class="text-sm px-3 py-1 rounded bg-blue-500 text-white">Edit</button>
            <button onclick="confirmDelete(${index})" class="text-sm px-3 py-1 rounded bg-red-500 text-white">Delete</button>`;

                li.append(content, actions);
                allList.appendChild(li);
                (task.completed ? completedList : pendingList).appendChild(li.cloneNode(true));
            });
        }

        function confirmDelete(index) {
            showConfirm('Are you sure you want to delete this task?', () => {
                tasks.splice(index, 1);
                saveToLocal();
                renderTasks();
                showToast('Task deleted.');
            });
        }

        function confirmToggle(index) {
            const message = tasks[index].completed
                ? 'Mark this task as pending again?'
                : 'Mark this task as completed?';
            showConfirm(message, () => {
                tasks[index].completed = !tasks[index].completed;
                saveToLocal();
                renderTasks();
                showToast(tasks[index].completed ? 'Marked complete!' : 'Marked pending.');
            });
        }

        function saveToLocal() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }

        function getPriorityColor(level) {
            return level === 'high' ? 'bg-red-400' : level === 'medium' ? 'bg-yellow-400' : 'bg-green-400';
        }

        // Events
        document.getElementById('addTaskBtn').onclick = () => openModal();
        document.getElementById('cancelBtn').onclick = () => closeModal();
        cancelConfirm.onclick = () => hideConfirm();
        confirmAction.onclick = () => {
            hideConfirm();
            confirmCallback();
        };

        document.getElementById('taskForm').addEventListener('submit', function (e) {
            e.preventDefault();
            saveTask();
        });

        document.getElementById('searchInput').oninput = function () {
            const keyword = this.value.toLowerCase();
            document.querySelectorAll('ul li').forEach(li => {
                li.style.display = li.textContent.toLowerCase().includes(keyword) ? '' : 'none';
            });
        };

        renderTasks();