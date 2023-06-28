/* eslint-disable max-classes-per-file */
import fetch from 'node-fetch';


class FOLIOsession {
  constructor(service, tenant, username, password) {
    this.service = service;
    this.tenant = tenant;
    this.username = username;
    this.password = password;
  }

  async folioFetch(path, baseOptions) {
    const url = `${this.service.url}${path.startsWith('/') ? '' : '/'}${path}`;

    const options = { ...baseOptions };
    options.headers = baseOptions?.headers || {};
    options.headers['X-Okapi-Tenant'] = this.tenant;
    if (this.token) options.headers['X-Okapi-Token'] = this.token;
    if (options.json) {
      options.headers['Content-type'] = 'application/json';
      options.body = JSON.stringify(options.json);
      delete options.json;
    }
    // console.log('options =', options);

    const res = await fetch(url, options);
    const text = await res.text();
    if (!res.ok) {
      const method = options.headers.method || 'GET';
      throw new Error(`HTTP ${method} ${url} failed with status ${res.status} (${res.statusText}) and text: ${text}`);
    }
    return JSON.parse(text);
  }

  async login() {
    const json = await this.folioFetch('authn/login', {
      method: 'POST',
      json: { tenant: this.tenant, username: this.username, password: this.password },
    });
    this.token = json.okapiToken;
  }
}


class FOLIOservice {
  constructor(url) {
    this.url = url;
  }

  async login(tenant, username, password) {
    const session = new FOLIOsession(this, tenant, username, password);
    await session.login();
    return session;
  }
}


const FOLIO = {
  service: (url) => new FOLIOservice(url),
};


export default FOLIO;