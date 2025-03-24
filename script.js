import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBl4Q-HIv4McBFewP4qfW7gvnkJezv4LKs",
    authDomain: "student-information-16bc7.firebaseapp.com",
    projectId: "student-information-16bc7",
    storageBucket: "student-information-16bc7.firebasestorage.app",
    messagingSenderId: "939023653355",
    appId: "1:939023653355:web:ca42fee6b7476d0ddfa1ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const taskContainer = document.getElementById("taskContainer");

// Task list
let tasks = [];
const colRef = collection(db, "pintado");

// Fetch tasks from Firestore
getDocs(colRef)
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            tasks.push({ ...doc.data(), id: doc.id });
        });
        console.log(tasks);
        renderTasks(); // 🔥 Re-render after fetching tasks
    })
    .catch((err) => {
        console.log(err.message);
    });

// Get urgency color
function getUrgencyColor(urgency) {
    if (urgency === "high") return "red";
    if (urgency === "mid") return "orange";
    return "green"; // Default is low
}

// Function to delete a task
async function deleteTask(taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, "pintado", taskId));
        tasks = tasks.filter(task => task.id !== taskId); // Remove from local array
        renderTasks();
        alert("Task deleted successfully!");
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// Function to render tasks
function renderTasks() {
    taskContainer.innerHTML = ""; // Clear previous tasks
    console.log(tasks.length);
    tasks.forEach(task => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-card");

        taskElement.innerHTML = `
            <small>${task.date}</small>
            <h3>${task.title}</h3>
            <span class="urgency-label" style="background-color: ${getUrgencyColor(task.urgency)};">
                ${task.urgency.toUpperCase()}
            </span>
            <p>${task.description}</p>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        `;

        taskContainer.appendChild(taskElement);
    });

    // Add event listener to each delete button
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            const taskId = button.getAttribute("data-id");
            deleteTask(taskId);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    const addTaskBtn = document.getElementById("addTaskBtn");
    const modal = document.getElementById("taskModal");
    const closeModal = document.querySelector(".close");
    const taskForm = document.getElementById("taskForm");

    // Debugging: Check for missing elements
    if (!addTaskBtn) console.error("❌ addTaskBtn NOT FOUND!");
    if (!modal) console.error("❌ taskModal NOT FOUND!");
    if (!closeModal) console.error("❌ closeModal NOT FOUND!");
    if (!taskForm) console.error("❌ taskForm NOT FOUND!");

    if (!addTaskBtn || !modal || !closeModal || !taskForm) {
        return;
    }

    // Show modal when "Add Task" is clicked
    addTaskBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Close modal when "X" is clicked
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Handle form submission
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("taskTitle").value;
        const description = document.getElementById("taskDesc").value;
        const urgency = document.getElementById("taskUrgency").value;
        const date = document.getElementById("taskDate").value;
        const taskId = Date.now().toString(); // Generate unique task ID

        // Ensure the date format is correct (YYYY-MM-DD)
        if (!date) {
            alert("Please select a valid date.");
            return;
        }

        const newTask = { title, description, urgency, date, id: taskId };

        try {
            await setDoc(doc(db, "pintado", taskId), newTask);
            tasks.push(newTask);
            renderTasks();
            alert("Task added successfully!");

            modal.style.display = "none";
            taskForm.reset();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });
});
