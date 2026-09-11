/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthFormLayout from "../../components/AuthFormLayout/AuthFormLayout";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Button from "../../components/Button/Button";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../contexts/AuthContext";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const firebaseIdToken = await user.getIdToken();
        const response = await fetch(`${VITE_BACKEND_URL}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseToken: firebaseIdToken,
            name: name,
          }),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          login(data.user);
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Erro no cadastro (Firebase ou backend):", error);

      if (error.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (error.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <AuthFormLayout
      title="Cadastre-se"
      welcomeTitle="Olá, amigo!"
      welcomeMessage="Registre-se com seus dados pessoais para usar todos os recursos do site."
      welcomeButtonText="Já tenho conta"
      welcomeButtonLink="/login"
      showLogo={true}
    >
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <Button child="Cadastrar" />
      </form>
    </AuthFormLayout>
  );
};

export default Register;
