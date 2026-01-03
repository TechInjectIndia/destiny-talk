"use client";

import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@destiny-ai/database";
import { Card, Button, Input, ErrorMessage } from "@destiny-ai/ui";

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <Card title={isSignUp ? "Create Account" : "Welcome Back"} className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <Input
          label="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          type="email"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          type="password"
          placeholder="••••••••"
        />
        {error && <ErrorMessage message={error} className="mb-2.5" />}
        <Button className="mt-2" onClick={handleAuth}>
          {isSignUp ? "Sign Up" : "Log In"}
        </Button>
        <div className="text-center mt-2 text-sm text-gray-600">OR</div>
        <Button
          className="mt-2 bg-white border-2 border-gray-300 hover:border-primary-500 hover:bg-gradient-to-r hover:from-primary-500 hover:to-purple-500 hover:text-white"
          onClick={handleGoogle}
          variant="secondary"
        >
          Continue with Google
        </Button>
        <div className="mt-2 text-center text-sm ">
          {isSignUp ? "Already have an account? " : "New to DestinyAI? "}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 cursor-pointer underline hover:text-blue-700 mt-2"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </div>
      </Card>
    </div>
  );
};
