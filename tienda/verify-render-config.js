#!/usr/bin/env node

/**
 * Script de verificación para comprobar que todas las URLs del VPS estén correctamente configuradas
 * en el proyecto sobrio-estilo-tienda-main
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs que deben estar presentes
const EXPECTED_URLS = [
  'http://softwarebycg.shop',
  'softwarebycg.shop'
];

// URLs que NO deben estar presentes
const FORBIDDEN_URLS = [
  'http://localhost:8000',
  'localhost:8000',
  '72.60.7.133:8001',
  'http://72.60.7.133:8001'
];

// Extensiones de archivos a verificar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Función para buscar en un archivo
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Verificar URLs prohibidas (ignorar comentarios)
    FORBIDDEN_URLS.forEach(url => {
      if (content.includes(url)) {
        // Verificar si está en comentarios
        const lines = content.split('\n');
        let isInComment = false;
        let foundInCode = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.includes('//') && trimmedLine.includes(url)) {
            // Está en comentario, ignorar
            continue;
          }
          if (trimmedLine.includes(url)) {
            foundInCode = true;
            break;
          }
        }
        
        if (foundInCode) {
          issues.push(`❌ URL prohibida encontrada: ${url}`);
        }
      }
    });
    
    // Verificar URLs esperadas (solo si no usa configuración centralizada)
    const hasExpectedUrl = EXPECTED_URLS.some(url => content.includes(url));
    const usesCentralizedConfig = content.includes('API_CONFIG') || content.includes('from \'../config/api\'');
    if (!hasExpectedUrl && !usesCentralizedConfig && (content.includes('fetch') || content.includes('axios'))) {
      issues.push(`⚠️  No se encontraron URLs del VPS en archivo con llamadas API`);
    }
    
    return issues;
  } catch (error) {
    return [`❌ Error leyendo archivo: ${error.message}`];
  }
}

// Función para recorrer directorios recursivamente
function scanDirectory(dir, issues = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, issues);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      const fileIssues = checkFile(filePath);
      if (fileIssues.length > 0) {
        issues.push({
          file: filePath,
          issues: fileIssues
        });
      }
    }
  });
  
  return issues;
}

// Función principal
function main() {
  console.log('🔍 Verificando configuración del VPS en sobrio-estilo-tienda-main...\n');
  
  const srcPath = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ No se encontró el directorio src/');
    process.exit(1);
  }
  
  const issues = scanDirectory(srcPath);
  
  if (issues.length === 0) {
    console.log('✅ Todas las URLs están correctamente configuradas para el VPS');
    console.log('✅ No se encontraron URLs de localhost');
    console.log('✅ Configuración centralizada implementada correctamente');
  } else {
    console.log('⚠️  Se encontraron los siguientes problemas:\n');
    issues.forEach(({ file, issues: fileIssues }) => {
      console.log(`📁 ${file}:`);
      fileIssues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    });
  }
  
  // Verificar archivo de configuración
  const configPath = path.join(srcPath, 'config', 'api.ts');
  if (fs.existsSync(configPath)) {
    console.log('✅ Archivo de configuración centralizada encontrado');
    const configContent = fs.readFileSync(configPath, 'utf8');
    if (configContent.includes('softwarebycg.shop')) {
      console.log('✅ URL del VPS configurada correctamente en api.ts');
    } else {
      console.log('❌ URL del VPS no encontrada en api.ts');
    }
  } else {
    console.log('❌ Archivo de configuración centralizada no encontrado');
  }
  
  console.log('\n🎯 Verificación completada');
}

// Ejecutar si se llama directamente
main();
