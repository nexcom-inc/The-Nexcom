import React from "react"
import { Html, Head, Body, Section, Text } from "@react-email/components"

const EmailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Html>
      <Head />
      <Body           style={{ padding: "24px" }}
      >
        <Section
          style={{
            margin: "0 auto",
          }}
        >
          {children}

          <Section
            style={{ textAlign: "center", marginTop: "40px", paddingTop: "32px" }}
          >
            <Text
              style={{
                fontSize: "10px",
                color: "#666666",
                margin: "0",
              }}
            >
              © The Nexcom {new Date().getFullYear()}
            </Text>
            <Text
              style={{
                fontSize: "10px",
                color: "#666666",
                margin: "0px 0 0",
              }}
            >
              Mariste, Dakar, Senegal
            </Text>
          </Section>
        </Section>
      </Body>
    </Html>
  )
}

export default EmailLayout

// style={{ backgroundColor: "#f6f9fc", padding: "24px" }}
