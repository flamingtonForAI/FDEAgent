import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const CONFIG_FILE = 'api-config.local.json';

// 开发服务器中间件：处理本地配置文件的读写
// SECURITY: Only allows localhost connections to prevent exposing API keys
function localConfigPlugin() {
  return {
    name: 'local-config',
    configureServer(server: any) {
      server.middlewares.use('/api/config', (req: any, res: any, next: any) => {
        // Security check: only allow requests from localhost
        const remoteAddr = req.socket?.remoteAddress || '';
        const isLocalhost = remoteAddr === '127.0.0.1' ||
                           remoteAddr === '::1' ||
                           remoteAddr === '::ffff:127.0.0.1';
        if (!isLocalhost) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Forbidden: localhost only' }));
          return;
        }

        const configPath = path.resolve(__dirname, CONFIG_FILE);

        if (req.method === 'GET') {
          // 读取配置
          try {
            if (fs.existsSync(configPath)) {
              const content = fs.readFileSync(configPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(null));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read config' }));
          }
        } else if (req.method === 'POST') {
          // 保存配置
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const config = JSON.parse(body);
              fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save config' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '127.0.0.1', // Security: only listen on localhost
      },
      plugins: [react(), localConfigPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
