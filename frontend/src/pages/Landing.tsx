import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, Share, Lock, Copy, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const { user } = useAuth();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-600/20 dark:from-orange-500/10 dark:via-red-500/10 dark:to-pink-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-17 w-full">
          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Column - Text Content */}
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold"
                variants={fadeInLeft}
                transition={{ duration: 0.8 }}
              >
                Share Code
                <motion.span 
                  className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent py-2"
                  variants={fadeInLeft}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Simply
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground max-w-lg"
                variants={fadeInLeft}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                A modern pastebin for developers. Create, share, and manage your code snippets with ease.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                variants={fadeInLeft}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {user ? (
                  <Link to="/create">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto"
                      >
                        Create New Paste
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto"
                        >
                          Get Started
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="px-8 py-4 text-lg font-semibold hover:bg-muted w-full sm:w-auto"
                        >
                          Sign In
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right Column - Feature Cards */}
            <motion.div 
              className="mt-16 lg:mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div 
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/80 transition-colors"
                variants={fadeInRight}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-center sm:text-left">
                  <motion.div 
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Code2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground">Syntax Highlighting</h3>
                    <p className="text-sm text-muted-foreground">Beautiful code formatting</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/80 transition-colors"
                variants={fadeInRight}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-center sm:text-left">
                  <motion.div 
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Share className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground">Easy Sharing</h3>
                    <p className="text-sm text-muted-foreground">Share with simple URLs</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/80 transition-colors sm:col-span-2 lg:col-span-1"
                variants={fadeInRight}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-center sm:text-left">
                  <motion.div 
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Lock className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground">Private Pastes</h3>
                    <p className="text-sm text-muted-foreground">Keep your code secure</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Pastebin?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for developers, by developers. Experience the difference with our modern approach to code sharing.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div 
              className="text-center"
              variants={scaleIn}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed with instant loading and responsive design across all devices.
              </p>
            </motion.div>

            <motion.div 
              className="text-center"
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your code is protected with industry-standard security and optional private pastes.
              </p>
            </motion.div>

            <motion.div 
              className="text-center"
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Copy className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Developer Friendly</h3>
              <p className="text-muted-foreground">
                API access, syntax highlighting, and tools designed specifically for developers.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
