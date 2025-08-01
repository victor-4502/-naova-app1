#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Naova - Comparador de Precios de Ferretería');
console.log('=' * 60);

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  try {
    execSync(`netstat -an | findstr :${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Función para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startApp() {
  try {
    // 1. Verificar Node.js
    console.log('📋 Verificando Node.js...');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js ${nodeVersion} detectado`);

    // 2. Verificar dependencias
    console.log('\n📦 Verificando dependencias...');
    if (!fs.existsSync('node_modules')) {
      console.log('Instalando dependencias del proyecto raíz...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    if (!fs.existsSync('backend/node_modules')) {
      console.log('Instalando dependencias del backend...');
      execSync('cd backend && npm install', { stdio: 'inherit' });
    }
    
    if (!fs.existsSync('frontend/node_modules')) {
      console.log('Instalando dependencias del frontend...');
      execSync('cd frontend && npm install', { stdio: 'inherit' });
    }
    // Verificar csv-parse en backend
    try {
      require.resolve('backend/node_modules/csv-parse');
    } catch {
      console.log('Instalando dependencia csv-parse en backend...');
      execSync('cd backend && npm install csv-parse', { stdio: 'inherit' });
    }
    console.log('✅ Dependencias verificadas');

    // 3. Verificar archivos de configuración
    console.log('\n⚙️  Verificando configuración...');
    
    if (!fs.existsSync('backend/.env')) {
      console.log('Creando archivo .env del backend...');
      fs.copyFileSync('backend/env.example', 'backend/.env');
    }
    
    if (!fs.existsSync('frontend/.env')) {
      console.log('Creando archivo .env del frontend...');
      fs.copyFileSync('frontend/env.example', 'frontend/.env');
    }
    console.log('✅ Archivos de configuración verificados');

    // 4. Verificar base de datos
    console.log('\n🗄️  Verificando base de datos...');
    const dbPath = path.join('backend', 'naova.sqlite');
    
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
      console.log('Inicializando base de datos...');
      execSync('cd backend && npm run db:setup', { stdio: 'inherit' });
      
      // Ejecutar scripts adicionales para completar la base de datos
      console.log('Completando configuración de la base de datos...');
      execSync('cd backend && node add_payment_status_column.cjs', { stdio: 'inherit' });
      execSync('cd backend && node add_sub_status_column.cjs', { stdio: 'inherit' });
      execSync('cd backend && node add-userid-to-providers.cjs', { stdio: 'inherit' });
      execSync('cd backend && node add-more-products.js', { stdio: 'inherit' });
      execSync('cd backend && node fix-quotations.cjs', { stdio: 'inherit' });
      execSync('node fix-inconsistent-quotations.cjs', { stdio: 'inherit' });
    }
    console.log('✅ Base de datos verificada');

    // 5. Verificar puertos
    console.log('\n🔌 Verificando puertos...');
    const backendPort = 5000;
    const frontendPort = 3000;
    
    if (isPortInUse(backendPort)) {
      console.log(`⚠️  Puerto ${backendPort} (backend) está en uso`);
    }
    
    if (isPortInUse(frontendPort)) {
      console.log(`⚠️  Puerto ${frontendPort} (frontend) está en uso`);
    }

    // 6. Iniciar servidores
    console.log('\n🎯 Iniciando servidores...');
    
    // Iniciar backend
    console.log('🚀 Iniciando backend...');
    const backendProcess = spawn('npm', ['run', 'dev:backend'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true
    });
    
    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.log(`[Backend Error] ${data.toString().trim()}`);
    });

    // Esperar un poco para que el backend se inicie
    await sleep(3000);
    
    // Iniciar frontend
    console.log('🚀 Iniciando frontend...');
    const frontendProcess = spawn('npm', ['run', 'dev:frontend'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true
    });
    
    frontendProcess.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });
    
    frontendProcess.stderr.on('data', (data) => {
      console.log(`[Frontend Error] ${data.toString().trim()}`);
    });

    // Esperar un poco más
    await sleep(5000);

    // 7. Mostrar información final
    console.log('\n' + '=' * 60);
    console.log('🎉 ¡Naova está listo!');
    console.log('=' * 60);
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend:  http://localhost:5000');
    console.log('📊 Health:   http://localhost:5000/health');
    console.log('\n👤 Usuarios de prueba:');
    console.log('   Admin:     admin / admin123');
    console.log('   Cliente:   cliente / cliente123');
    console.log('   Proveedor: hardwarestorea / proveedor123');
    console.log('\n💡 Para detener los servidores: Ctrl+C');
    console.log('=' * 60);

    // Manejar cierre de la aplicación
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo servidores...');
      backendProcess.kill();
      frontendProcess.kill();
      console.log('✅ Servidores detenidos');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error durante el inicio:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
startApp(); 