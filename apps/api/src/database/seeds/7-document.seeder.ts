import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

export default class DocumentSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const documentRepo = dataSource.getRepository(Document);
    const historyRepo = dataSource.getRepository(DocumentHistory);
    const userRepo = dataSource.getRepository(User);

    const admin = await userRepo.findOne({
      where: { email: "admin@example.com" },
    });

    const sampleDocs = [
      {
        slug: "terms-of-service",
        title: "Terms of Service",
        subtitle:
          "Last updated: September 2026 - Please read these terms carefully.",
        description:
          "Terms and conditions governing the use of the NIddle platform.",
        version: 1,
        isPublished: true,
        effectiveDate: new Date("2026-09-01T00:00:00.000Z"),
        changeSummary: "Initial publication of Terms of Service",
        author: admin,
        sections: [
          {
            id: "acceptance",
            title: "1. Acceptance of Terms",
            content:
              "By accessing or using the **NIddle** application and associated services provided by NIAEFEUP, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, *you must discontinue use of the platform immediately*.",
            order: 1,
            sections: [
              {
                id: "eligibility",
                title: "1.1 Eligibility",
                content:
                  "Access to specific features may require active enrollment or association with **Faculty of Engineering, University of Porto (FEUP)**.",
                order: 1,
              },
              {
                id: "account-security",
                title: "1.2 Account Security",
                content:
                  "You are responsible for maintaining the confidentiality of your credentials. You agree to notify administrators immediately of any **unauthorized access**.",
                order: 2,
              },
            ],
          },
          {
            id: "acceptable-use",
            title: "2. User Conduct & Acceptable Use",
            content:
              "Users agree to use the service in compliance with applicable university regulations and Portuguese law.",
            order: 2,
            sections: [
              {
                id: "prohibited",
                title: "2.1 Prohibited Activities",
                content:
                  "You may **not**:\n- Reverse engineer or disrupt platform infrastructure\n- Misrepresent student association affiliations\n- Scrape data at excessive or unauthorized rates",
                order: 1,
              },
            ],
          },
          {
            id: "disclaimers",
            title: "3. Disclaimers and Limitations of Liability",
            content:
              'The service is provided on an *"as is"* and *"as available"* basis without warranties of any kind.',
            order: 3,
          },
        ],
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy",
        subtitle:
          "Effective as of September 2026 - Compliance with GDPR and Portuguese Data Protection Law.",
        description:
          "How NIAEFEUP collects, processes, and protects your personal data.",
        version: 1,
        isPublished: true,
        effectiveDate: new Date("2026-09-01T00:00:00.000Z"),
        changeSummary: "Initial publication of Privacy Policy under GDPR",
        author: admin,
        sections: [
          {
            id: "data-collection",
            title: "1. Information We Collect",
            content:
              "We collect minimal personal data required to provide and authenticate academic services.",
            order: 1,
            sections: [
              {
                id: "account-info",
                title: "1.1 Account Information",
                content:
                  "Your institutional email address, full name, and affiliated student association memberships.",
                order: 1,
              },
              {
                id: "usage-logs",
                title: "1.2 Service Usage Data",
                content:
                  "Technical logs including IP addresses, timestamps, and API access tokens used to prevent abuse.",
                order: 2,
              },
            ],
          },
          {
            id: "gdpr-rights",
            title: "2. Data Subject Rights (GDPR)",
            content:
              "Under the **General Data Protection Regulation (GDPR)**, you have the right to:\n- *Access* your personal data\n- *Rectify* inaccurate records\n- *Erase* your personal data (*Right to be Forgotten*)\n- *Export* data in a portable format",
            order: 2,
          },
          {
            id: "security",
            title: "3. Data Retention and Security",
            content:
              "All data is securely encrypted in transit (TLS 1.3) and at rest. Authentication logs are retained for audit purposes in accordance with legal obligations.",
            order: 3,
          },
        ],
      },
    ];

    for (const docData of sampleDocs) {
      const existing = await documentRepo.findOne({
        where: { slug: docData.slug },
      });
      if (!existing) {
        const created = documentRepo.create(docData);
        const saved = await documentRepo.save(created);

        const history = historyRepo.create({
          documentId: saved.id,
          version: saved.version,
          title: saved.title,
          subtitle: saved.subtitle,
          description: saved.description,
          sections: saved.sections,
          changeSummary: saved.changeSummary,
          author: saved.author,
          authorEmail: saved.author?.email || null,
          isPublished: saved.isPublished,
          effectiveDate: saved.effectiveDate,
        });
        await historyRepo.save(history);
      }
    }
  }
}
