import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

// Flag to track if initialization has been attempted
let initializationAttempted = false

export async function ensureTablesExist() {
  // Only attempt initialization once
  if (initializationAttempted) {
    return
  }

  initializationAttempted = true

  try {
    console.log("Checking if database tables exist...")

    // Check if the blog_posts table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blog_posts'
      );
    `)

    const tableExists = tableCheck.rows[0]?.exists === true

    if (!tableExists) {
      console.log("Tables don't exist, creating them...")

      // Create the subscribers table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS subscribers (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)

      // Create the users table for authentication and role-based access
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          clerk_id TEXT NOT NULL UNIQUE,
          role VARCHAR(20) DEFAULT 'user' NOT NULL,
          is_first_user BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)
    } else {
      console.log("Tables exist, updating schema...")
      
      console.log("Now checking users table exists...")
      
      // Ensure users table exists
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT,
            clerk_id TEXT NOT NULL UNIQUE,
            role VARCHAR(20) DEFAULT 'user' NOT NULL,
            is_first_user BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log("Users table created or already exists");
      } catch (error) {
        console.error("Error creating users table:", error);
      }

      // Create the blog_posts table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          cover_image TEXT,
          author TEXT NOT NULL,
          read_time TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      // Create the projects table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT NOT NULL,
          items JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      console.log("Tables created successfully")

      // Insert sample data
      await insertSampleData()
    }

    return true
  } catch (error) {
    console.error("Error initializing database tables:", error)
    return false
  }
}

async function insertSampleData() {
  try {
    // Check if blog_posts table is empty
    const postsCheck = await db.execute(sql`SELECT COUNT(*) FROM blog_posts`)
    const postsCount = Number.parseInt(String(postsCheck.rows[0]?.count || "0"))

    if (postsCount === 0) {
      console.log("Inserting sample blog posts...")

      // Insert sample blog posts
      await db.execute(sql`
        INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, read_time)
        VALUES 
        (
          'Understanding Zero-Day Vulnerabilities',
          'understanding-zero-day-vulnerabilities',
          'What they are, how they''re exploited, and how to protect your systems.',
          '<p>Zero-day vulnerabilities represent one of the most significant threats in cybersecurity today. These vulnerabilities are unknown to the software vendor and have no available patches, leaving systems exposed to potential attacks.</p><h2>What is a Zero-Day Vulnerability?</h2><p>A zero-day vulnerability is a software security flaw that is unknown to those who should be interested in mitigating the vulnerability (including the vendor of the target software). Until the vulnerability is mitigated, hackers can exploit it to adversely affect computer programs, data, additional computers or a network.</p><p>The term "zero-day" refers to the fact that developers have had zero days to address and patch the vulnerability. Once a vulnerability becomes known, a race begins between the threat actors who want to exploit it and the developers who need to fix it.</p>',
          '/unseen-threat.png',
          'John Doe',
          '8 min read'
        ),
        (
          'Ransomware Protection Strategies',
          'ransomware-protection-strategies',
          'Effective strategies to prevent, detect, and recover from ransomware attacks.',
          '<p>Ransomware attacks continue to pose a significant threat to organizations of all sizes. This article outlines effective strategies to prevent, detect, and recover from ransomware attacks.</p><h2>Understanding Ransomware</h2><p>Ransomware is a type of malicious software that encrypts a victim''s files. The attackers then demand a ransom from the victim to restore access to the data upon payment. Users are shown instructions for how to pay a fee to get the decryption key. The costs can range from a few hundred dollars to thousands, payable to cybercriminals in Bitcoin or other cryptocurrencies.</p>',
          '/digital-shield.png',
          'Jane Smith',
          '10 min read'
        ),
        (
          'Securing Cloud Infrastructure',
          'securing-cloud-infrastructure',
          'Best practices for securing your cloud infrastructure and applications.',
          '<p>As organizations continue to migrate their infrastructure and applications to the cloud, securing these environments becomes increasingly critical. This article outlines best practices for securing your cloud infrastructure.</p><h2>Understanding the Shared Responsibility Model</h2><p>Cloud security operates on a shared responsibility model, where the cloud provider secures the underlying infrastructure, and you are responsible for securing your data, applications, and access controls. Understanding this division of responsibilities is crucial for implementing effective security measures.</p>',
          '/secure-cloud-network.png',
          'Michael Chen',
          '12 min read'
        )
      `)

      console.log("Sample blog posts inserted")
    }

    // Check if subscribers table is empty
    const subscribersCheck = await db.execute(sql`SELECT COUNT(*) FROM subscribers`)
    const subscribersCount = Number.parseInt(String(subscribersCheck.rows[0]?.count || "0"))

    if (subscribersCount === 0) {
      console.log("Inserting sample subscribers...")

      // Insert sample subscribers
      await db.execute(sql`
        INSERT INTO subscribers (email, name)
        VALUES 
        ('john.doe@example.com', 'John Doe'),
        ('jane.smith@example.com', 'Jane Smith'),
        ('robert.johnson@example.com', 'Robert Johnson')
      `)

      console.log("Sample subscribers inserted")
    }

    // Check if projects table is empty
    const projectsCheck = await db.execute(sql`SELECT COUNT(*) FROM projects`)
    const projectsCount = Number.parseInt(String(projectsCheck.rows[0]?.count || "0"))

    if (projectsCount === 0) {
      console.log("Inserting sample projects...")

      // Insert penetration testing project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Penetration Testing',
          'Identify vulnerabilities before attackers do with our comprehensive penetration testing services.',
          'AlertTriangle',
          ${JSON.stringify([
            "Web Application Testing",
            "Network Infrastructure Testing",
            "Mobile Application Testing",
            "Social Engineering Assessments",
            "IoT Device Security Testing",
          ])}
        )
      `)

      // Insert security audits project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Security Audits',
          'Comprehensive assessment of your security posture against industry standards and best practices.',
          'Shield',
          ${JSON.stringify([
            "Compliance Assessments",
            "Security Architecture Review",
            "Cloud Security Assessment",
            "Risk Assessment",
            "Security Policy Review",
          ])}
        )
      `)

      // Insert security training project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Security Training',
          'Empower your team with the knowledge to recognize and respond to security threats.',
          'FileCode',
          ${JSON.stringify([
            "Security Awareness Training",
            "Phishing Simulations",
            "Developer Security Training",
            "Incident Response Drills",
            "Executive Security Briefings",
          ])}
        )
      `)

      // Insert incident response project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Incident Response',
          'Rapid and effective response to security incidents to minimize damage and recovery time.',
          'Lock',
          ${JSON.stringify([
            "24/7 Incident Response",
            "Malware Analysis",
            "Digital Forensics",
            "Breach Containment",
            "Post-Incident Analysis",
          ])}
        )
      `)

      // Insert cloud security project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Cloud Security',
          'Secure your cloud infrastructure and applications with our specialized cloud security services.',
          'Server',
          ${JSON.stringify([
            "Cloud Security Architecture",
            "Cloud Configuration Review",
            "Container Security",
            "Serverless Security",
            "Cloud Security Monitoring",
          ])}
        )
      `)

      // Insert security consulting project
      await db.execute(sql`
        INSERT INTO projects (title, description, icon, items)
        VALUES (
          'Security Consulting',
          'Expert guidance on cybersecurity strategy, architecture, and best practices.',
          'Users',
          ${JSON.stringify([
            "Security Program Development",
            "Security Architecture Design",
            "Compliance Consulting",
            "Security Tool Selection",
            "CISO as a Service",
          ])}
        )
      `)

      console.log("Sample projects inserted")
    }
  } catch (error) {
    console.error("Error inserting sample data:", error)
  }
}
