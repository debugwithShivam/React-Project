import usePageReveal from "./usePageReveal";
import img1 from './img1.png'
import img2 from './img2.png'
import img3 from './img3.png'
import img4 from './img4.png'
import img5 from './img5.png'
import img6 from './img6.png'
import ScreenshotCard from "./ScreenshotCard";
const TodoProject = () => {
  usePageReveal();

  return (
    <div className="page-wrapper container detail-section">

      {/* HEADER */}
      <div
        className="section-header page-reveal"
        style={{ opacity: 0, transform: "translateY(40px)" }}
      >
        <h2>Current Project: Todo Productivity System</h2>
        <div className="underline"></div>
      </div>

      {/* OVERVIEW */}
      <div
        className="glass-card gs-reveal"
        style={{ opacity: 0, transform: "translateY(40px)" }}
      >
        <h3 style={{ color: "var(--accent)", marginBottom: "1rem" }}>
          Project Overview
        </h3>

        <p style={{ lineHeight: "1.8", color: "var(--text-muted)" }}>
          This project is a fully interactive productivity system built around
          the concept of structured task management. Instead of a simple todo
          list, the application allows users to organize tasks across multiple
          pages, track progress using timers, pause and resume tasks, and
          customize the working environment.  
          The goal of this project was to explore how real productivity tools
          manage state, user interaction, and dynamic UI updates.
        </p>

        {/* IMAGE PLACEHOLDER
        <div style={{ marginTop: "2rem" }}>
          <img
            src="/images/todo-overview.png"
            alt="Todo App Interface"
            style={{
              width: "100%",
              borderRadius: "10px",
              marginTop: "1rem",
            }}
          />
        </div> */}
      </div>

      {/* FEATURES */}
      <div
        className="glass-card gs-reveal"
        style={{ opacity: 0, transform: "translateY(40px)", marginTop: "2rem" }}
      >
        <h3 style={{ color: "var(--accent)", marginBottom: "1rem" }}>
          Core Features
        </h3>

        <ul
          style={{
            lineHeight: "2",
            color: "var(--text-muted)",
            paddingLeft: "1rem",
          }}
        >
          <li>
            <strong>Multi-Page Task Management</strong> – Users can create
            multiple pages, each containing its own set of todos. This allows
            organization by topic, project, or category.
          </li>

          <li>
            <strong>Task Timer System</strong> – Every task can be linked with a
            timer. Users can select preset durations such as 10, 20, 30 minutes
            or 1 hour.
          </li>

          <li>
            <strong>Pause & Resume Tasks</strong> – Tasks can be paused and
            resumed without losing progress.
          </li>

          <li>
            <strong>Text-to-Speech Support</strong> – Tasks can be spoken aloud
            using browser speech synthesis.
          </li>

          <li>
            <strong>Task Notifications</strong> – The system sends reminders and
            alerts when timers finish.
          </li>

          <li>
            <strong>Advanced Sorting</strong> – Tasks can be filtered by Latest,
            Oldest, Popular, or Timer based views.
          </li>

          <li>
            <strong>Search System</strong> – Users can instantly search through
            their tasks using the search bar.
          </li>

          <li>
            <strong>Theme Customization</strong> – Background colors and text
            colors can be customized for a personalized working environment.
          </li>
        </ul>
      </div>

      {/* TECHNICAL IMPLEMENTATION */}
      <div
        className="glass-card gs-reveal"
        style={{ opacity: 0, transform: "translateY(40px)", marginTop: "2rem" }}
      >
        <h3 style={{ color: "var(--accent)", marginBottom: "1rem" }}>
          Technical Implementation
        </h3>

        <p style={{ lineHeight: "1.8", color: "var(--text-muted)" }}>
          The application focuses heavily on dynamic UI behavior and state
          management. Each page manages its own collection of todos, while
          timers operate independently and update the interface in real time.
        </p>

        <ul style={{ lineHeight: "2", color: "var(--text-muted)" }}>
          <li>Component based architecture</li>
          <li>Dynamic state updates for tasks and timers</li>
          <li>Real-time countdown logic</li>
          <li>Speech synthesis integration</li>
          <li>Browser notification API</li>
          <li>Search filtering algorithms</li>
          <li>Dynamic UI rendering</li>
        </ul>
      </div>

      {/* UI SHOWCASE */}
      <div
        className="glass-card gs-reveal"
        style={{ opacity: 0, transform: "translateY(40px)", marginTop: "2rem" }}
      >
        <h3 style={{ color: "var(--accent)", marginBottom: "1rem" }}>
          Interface Showcase
        </h3>

        <p style={{ color: "var(--text-muted)" }}>
          Below are some examples of the user interface and interaction flows
          from the application.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
           <ScreenshotCard
        image={img2}
        title="Task Management Features"
        description="
        This interface shows the core task management system. Users can create,
        edit, delete, pause, and mark todos as favourites. Tasks can be sorted
        by latest, oldest, or popularity, and users can search through tasks
        instantly. The interface also allows customization such as changing the
        background image and adjusting text colors. Tasks can also be read
        aloud using browser speech synthesis."
      />

      {/* IMAGE 2 */}

      <ScreenshotCard
        image={img4}
        title="Todo Timer System"
        description="
        Each todo item can have its own timer. Users can set custom durations
        such as 10 minutes, 20 minutes, 30 minutes, or 1 hour. Once the timer
        starts, the system tracks the countdown and helps the user focus on the
        task. This feature simulates productivity techniques like the Pomodoro
        method."
      />

      {/* IMAGE 3 */}

      <ScreenshotCard
        image={img6}
        title="Unlimited Page System"
        description="
        The application allows users to create unlimited pages to organize
        their tasks. Each page can have its own title, description, and tags.
        Users can mark pages as favourites, search pages, view oldest pages,
        and delete pages when they are no longer needed."
      />

      {/* IMAGE 4 */}

      <ScreenshotCard
        image={img5}
        title="Page Creation Interface"
        description="
        This interface shows how new pages are created. Users can define a
        title, description, and tags for each page. The UI was designed to be
        simple and fast so users can quickly create structured workspaces for
        different topics or projects."
      />

      {/* IMAGE 5 */}

      <ScreenshotCard
        image={img1}
        title="Independent Todo System Per Page"
        description="
        Every page contains its own independent todo system. Tasks created
        inside one page do not affect tasks on other pages. Each page manages
        its own todos, timers, pause states, edits, and favourites. This design
        makes the application behave more like a workspace manager rather than
        a single todo list."
      />
        </div>
      </div>

    </div>
  );
};

// <img
//             src={img2}
//             alt="Todo Pages"
//             style={{ width: "100%", borderRadius: "10px", marginBottom: "1rem" }}
//           />

         
//           <img
//             src={img4}
//             alt="Todo Timer"
//             style={{ width: "100%", borderRadius: "10px" }}
//           />
//           <img
//             src={img6}
//             alt="Todo Timer"
//             style={{ width: "100%", borderRadius: "10px" }}
//           />
//           <img
//             src={img5}
//             alt="Todo Timer"
//             style={{ width: "100%", borderRadius: "10px" }}
//           />
//           <img
//             src={img1}
//             alt="Todo Timer"
//             style={{ width: "100%", borderRadius: "10px" }}
//           />

export default TodoProject;