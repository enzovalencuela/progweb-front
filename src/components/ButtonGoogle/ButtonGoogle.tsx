/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleIcon from "../../assets/googleIcon.svg";
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
} from "../../firebaseConfig";
import "./ButtonGoogle.css";
import { motion } from "framer-motion";

function GoogleLoginButton({ onSuccess, onError }: any) {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      console.error(
        "Erro ao fazer login com o Google (componente GoogleLoginButton):",
        error
      );
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <motion.button
      onClick={handleGoogleSignIn}
      className="button-google"
      whileTap={{ scale: 0.97 }}
    >
      <img src={GoogleIcon} alt="" />
      <span>Entre com sua conta Google</span>
    </motion.button>
  );
}

export default GoogleLoginButton;
