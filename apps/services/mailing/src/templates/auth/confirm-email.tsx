import React from "react"
import {  Text, Container, Link } from "@react-email/components"
import EmailLayout from "../layout"

export const ConfirmEmailTemplate = ({url} : {url: string}) => {
  return (
    <EmailLayout>
      <Container style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f6f9fc",
        padding: "48px 24px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}>
        {/* Logo/Icon placeholder */}
        <div
          style={{
            margin: "0 auto 32px",
          }}
        >
          {/* <img src="https://nexcom.mouhamedlamotte.tech/static/logo/nexcom.svg" alt="nexcom logo" /> */}
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#000",
              marginBottom: "16px",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            The Nexcom
          </Text>
        </div>

        <Text
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#000",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Vous y êtes presque !
        </Text>

        <Text
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Veuillez confirmer votre adresse email pour continuer .
        </Text>

        <Link
          href={url}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            display: "inline-block",
            cursor: "pointer"
          }}
        >
          Confirmer mon email
        </Link>

        <Text
          style={{
            fontSize: "14px",
            color: "#666",
            marginTop: "32px",
            textAlign: "center",
          }}
        >
          Merci de votre confiance,
          <br />
          La Nexcom Team
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#666",
            marginTop: "42px",
            textAlign: "center",
          }}
        >
          si vous n'ariver pas à cliquer sur le button vous pouvez copier et coller le lien suivant : {url}.
        </Text>
      </Container>
    </EmailLayout>
  )
}

export default ConfirmEmailTemplate

