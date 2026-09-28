
"use client";
import DynamicForm from "../../../components/DynamicForm/DynamicForm";
import { defaultFormConfig } from "../../../config/default.formConfig";
import { formFields } from "../../../config/formConfig";
import { useState, useEffect } from "react";

const noAccessCodeConfig = { ...defaultFormConfig, requireAccessCode: false };

export default function CreateFormPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        maxWidth: "600px",
        width: "100%",
        margin: "0 auto",
        padding: "2rem 0",
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
        marginLeft: isMobile ? 0 : "250px"
      }}
    >
      <DynamicForm fields={formFields} config={noAccessCodeConfig} />
    </div>
  );
}
