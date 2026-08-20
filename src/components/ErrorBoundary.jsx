import React from "react";
import { Home as HomeIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRefresh = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-soft mb-6 ring-1 ring-accent/30">
            <HomeIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-3">
            Une erreur inattendue est survenue
          </h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Veuillez rafraîchir la page ou mettre à jour votre navigateur.
          </p>
          <Button onClick={this.handleRefresh} size="lg" className="shadow-soft">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir la page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}