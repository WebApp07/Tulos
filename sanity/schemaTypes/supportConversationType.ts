import { defineArrayMember, defineField, defineType } from "sanity";

export const supportConversationType = defineType({
  name: "supportConversation",
  title: "Support Conversation",
  type: "document",
  fields: [
    defineField({
      name: "conversationId",
      title: "Conversation ID",
      type: "string",
      description: "Unique ID generated on the client and used to resume the thread.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "Chat bot", value: "ai_chat" },
          { title: "Live chat handoff", value: "live_chat" },
          { title: "Offline form", value: "offline_form" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Awaiting agent", value: "awaiting_agent" },
          { title: "In progress", value: "in_progress" },
          { title: "Resolved", value: "resolved" },
        ],
      },
      initialValue: "awaiting_agent",
    }),
    defineField({
      name: "clerkUserId",
      title: "Customer User ID",
      type: "string",
      description: "Clerk user ID, only set when the customer is signed in.",
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "subject",
      title: "Subject",
      type: "string",
      description: "Short summary of the topic, used to prioritize the queue.",
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              options: {
                list: [
                  { title: "User", value: "user" },
                  { title: "Assistant", value: "assistant" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "content",
              title: "Content",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "createdAt",
              title: "Created At",
              type: "datetime",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    }),
    defineField({
      name: "note",
      title: "Agent Note",
      type: "text",
      description: "Internal note for support agents.",
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      email: "email",
      subject: "subject",
      status: "status",
      updated: "updatedAt",
    },
    prepare(select) {
      return {
        title: select.subject || select.name || select.email || "Support conversation",
        subtitle: `${select.status || "awaiting_agent"}${select.email ? ` · ${select.email}` : ""}`,
      };
    },
  },
});