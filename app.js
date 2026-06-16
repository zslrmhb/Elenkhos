/* Renderer — opportunity-roi-v3 lesson site. All content from window.MANIFEST + window.SIGNALS.
   No roadmap decisions defined here. Owned by roadmap-website-builder. */
(function () {
  "use strict";
  var M = window.MANIFEST, SIG = window.SIGNALS || [];
  if (!M) return;
  var sigById = {}; SIG.forEach(function (s) { sigById[s.signal_id] = s; });
  var unitById = {}; M.units.forEach(function (u) { unitById[u.unit_id] = u; });
  var lessonById = {}; M.lessons.forEach(function (l) { lessonById[l.lesson_id] = l; });
  var roleById = {}; M.roles.forEach(function (r) { roleById[r.role_id] = r; });

  var STATUS = {must_do_now:"Must do now", selective_now:"Selective now", later:"Later", optional:"Optional", cut_for_now:"Cut for now"};
  var DISP = {primary:"Primary", supplement:"Supplement", reference_only:"Reference", later:"Later", cut_for_now:"Cut"};

  function el(t, a, c) {
    var n = document.createElement(t);
    if (a) Object.keys(a).forEach(function (k) {
      if (k === "text") n.textContent = a[k];
      else if (k.indexOf("data-")===0 || k.indexOf("aria-")===0 || k==="role" || k==="tabindex") n.setAttribute(k, a[k]);
      else n[k] = a[k];
    });
    (c||[]).forEach(function (x) { if (x) n.appendChild(x); });
    return n;
  }
  function chip(t, cls) { return el("span", {className:"chip "+(cls||""), text:t}); }
  function statusChip(s) { return chip(STATUS[s]||s, "status-"+s); }
  function a(href, text) { return el("a", {href:href, text:text, target:"_blank", rel:"noopener"}); }
  function inPagesDir() { return /\/pages\/[^/]*$/.test(window.location.pathname); }
  function siteHref(path) { return (inPagesDir() ? "../" : "") + path; }
  function pageHref(path) { return inPagesDir() ? path : "pages/" + path; }
  function docHref(path) { return siteHref(path.replace(/^docs\//, "docs/")); }
  function sectionLinks(sections) {
    var wrap=el("div",{});
    (sections||[]).forEach(function(section,i){
      if(i) wrap.appendChild(el("br",{}));
      var match=section.match(/^(.*?)(?:\s+[—-]\s+)?(https:\/\/\S+)$/);
      if(match) wrap.appendChild(a(match[2],match[1].trim()||match[2]));
      else wrap.appendChild(document.createTextNode(section));
    });
    if(!sections || !sections.length) wrap.appendChild(document.createTextNode("—"));
    return wrap;
  }
  function sigName(id) { return sigById[id] ? sigById[id].skill : id; }

  function provenance(c) {
    var f=M.freshness;
    c.appendChild(el("p", {className:"provenance", text:
      "Freshness "+f.status+" · roadmap "+f.roadmap_generated_at.slice(0,10)+" · hiring "+f.market_generated_at.slice(0,10)+
      " · Xiaohongshu "+(f.xiaohongshu_generated_at||"").slice(0,10)+" ("+f.xiaohongshu_posts+" posts/"+f.xiaohongshu_authors+" authors) · source: content-manifest.json"}));
    c.appendChild(el("p", {className:"provenance", text:f.reason}));
  }
  function scoreRow(s) {
    // s: object with market/xhs/overall
    return el("p", {className:"scorerow"}, [
      chip("Hiring "+s.market_roi_score, "src-market"),
      chip("XHS "+s.xiaohongshu_signal_score, "src-xhs"),
      chip("Overall "+s.overall_priority_score, "src-overall")]);
  }

  /* ---------- overview ---------- */
  function renderOverview(main) {
    var n = M.pareto_niche.candidates.filter(function(c){return c.decision==="selected";})[0];
    var hedge = M.pareto_niche.candidates.filter(function(c){return c.decision==="hedge";})[0];
    var primary = M.projects.filter(function(p){return p.decision==="active_primary";})[0];
    var activeUnitHours = M.units.filter(function(u){return u.status==="must_do_now" || u.status==="selective_now";})
      .reduce(function(sum,u){return sum+u.estimated_hours;},0);

    // One capstone, two independently reviewable packages.
    var proj = el("section", {"aria-labelledby":"proj-h"});
    proj.appendChild(el("h2", {id:"proj-h", text:"One capstone, two packages"}));
    proj.appendChild(el("p", {className:"lede", text:"A single model lineage runs from audited data and from-scratch pretraining through Qwen post-training, quantized export, C++ serving, scheduling, and release qualification."}));
    var pg = el("div", {className:"grid grid-2"});
    M.phases.filter(function(p){return p.phase_id!=="phase-interview-gates";}).forEach(function(ph, i){
      var c = el("div", {className:"card", "data-canonical-id":ph.phase_id});
      c.appendChild(el("div", {className:"path-meta", text:"Package "+(i===0?"A":"B")}));
      c.appendChild(el("h3", {text:ph.title}));
      c.appendChild(el("p", {text:ph.outcome}));
      var secs = M.sections.filter(function(s){return s.phase_id===ph.phase_id;});
      c.appendChild(el("p", {className:"path-meta", text:secs.length+" sections · milestone: "+ph.milestone}));
      c.appendChild(el("p", {}, [el("a",{href:pageHref("syllabus.html#"+ph.phase_id), text:"Open the build →"})]));
      pg.appendChild(c);
    });
    proj.appendChild(pg);
    main.appendChild(proj);

    var thesis = el("section", {"aria-labelledby":"th-h", "data-canonical-id":n.candidate_id});
    thesis.appendChild(el("h2", {id:"th-h", text:"Why these two"}));
    var card = el("div", {className:"card detail-panel"});
    card.appendChild(el("h3", {}, [document.createTextNode(n.label+" "), chip("score "+n.pareto_niche_score,"priority-P1"), chip("selected","status-must_do_now")]));
    card.appendChild(el("p", {text:n.thesis}));
    var ax = el("p", {}, [el("strong", {text:"Skill axes: "})]);
    n.skill_axes.forEach(function(x,i){ if(i) ax.appendChild(document.createTextNode(" × ")); ax.appendChild(chip(x,"lane")); });
    card.appendChild(ax);
    card.appendChild(el("p", {className:"path-meta", text:"Hedge: "+hedge.label+" ("+hedge.pareto_niche_score+"). Full comparison on the Niche page."}));
    thesis.appendChild(card);

    var fal = el("details", {});
    fal.appendChild(el("summary", {text:"Falsification — first checkpoint Aug–Oct 2026"}));
    var ul = el("ul", {}); n.falsification_conditions.forEach(function(x){ ul.appendChild(el("li",{text:x})); });
    fal.appendChild(ul); thesis.appendChild(fal);
    main.appendChild(thesis);

    var now = el("section", {"aria-labelledby":"now-h"});
    now.appendChild(el("h2", {id:"now-h", text:"What to do now"}));
    var grid = el("div", {className:"grid grid-2"});
    var doNow = el("div", {className:"card", "data-canonical-id":"decision-now"});
    doNow.appendChild(el("h3", {text:"Do now"}));
    M.units.filter(function(u){return u.status==="must_do_now";}).forEach(function(u){
      doNow.appendChild(el("p", {}, [statusChip(u.status), el("strong",{text:" "+u.title}), el("span",{className:"path-meta",text:" · "+u.estimated_hours+"h · personal ROI "+u.personal_roadmap_roi})]));
    });
    if (primary) doNow.appendChild(el("p", {}, [chip("Primary project","status-must_do_now"), el("strong",{text:" "+primary.title}), el("span",{className:"path-meta",text:" · "+primary.estimated_hours+"h integration + "+activeUnitHours+"h build units"})]));
    doNow.appendChild(el("p", {className:"path-meta", text:"Then "+M.units.filter(function(u){return u.status==="selective_now";}).length+" selective-now units — see the Syllabus."}));
    grid.appendChild(doNow);
    var cap = el("div", {className:"card", "data-canonical-id":"capacity"});
    cap.appendChild(el("h3", {text:"Capacity & deadline"}));
    var c = M.capacity, pct = Math.round(100*(c.allocated_hours||0)/c.planning_budget_hours);
    cap.appendChild(el("p", {className:"capacity-note", text:c.hours_per_week+" h/wk × "+c.weeks_to_deadline+" wks → "+c.available_hours+"h; reserve held back → "+c.planning_budget_hours+"h committed."}));
    var bar = el("div", {className:"capacity-bar", role:"img", "aria-label":"Allocated "+c.allocated_hours+" of "+c.planning_budget_hours+" budget hours"});
    bar.appendChild(el("span", {style:"width:"+Math.min(pct,100)+"%"})); cap.appendChild(bar);
    cap.appendChild(el("p", {className:"capacity-note", text:"Committed "+c.allocated_hours+"h ("+pct+"%) · "+(c.available_hours-c.planning_budget_hours)+"h reserve · deadline "+M.planning_profile.deadline}));
    grid.appendChild(cap);
    now.appendChild(grid);
    main.appendChild(now);

    // recruiter proof
    var rec = el("section", {"aria-labelledby":"rec-h"});
    rec.appendChild(el("h2", {id:"rec-h", text:"Proof at a glance"}));
    if (primary) { var pj=el("div",{className:"card","data-canonical-id":primary.project_id});
      pj.appendChild(el("h3",{text:primary.title})); pj.appendChild(el("p",{text:"Proves: "+primary.signal_ids.map(sigName).join(", ")}));
      var ul2=el("ul",{}); primary.acceptance_criteria.slice(0,3).forEach(function(x){ul2.appendChild(el("li",{text:x}));}); pj.appendChild(ul2); rec.appendChild(pj); }
    var strong = el("div",{className:"card"}); strong.appendChild(el("h3",{text:"Demonstrated capabilities"}));
    var sl=el("ul",{}); SIG.filter(function(s){return (s.evidence_maturity||0)>=4;}).sort(function(x,y){return y.evidence_maturity-x.evidence_maturity;})
      .forEach(function(s){ sl.appendChild(el("li",{"data-canonical-id":s.signal_id, text:s.skill+" — maturity "+s.evidence_maturity+"/6 ("+(s.evidence_notes[0]||"")+")"})); });
    strong.appendChild(sl); rec.appendChild(strong); main.appendChild(rec);

    // learner path
    var path = el("section", {"aria-labelledby":"path-h"});
    path.appendChild(el("h2", {id:"path-h", text:"The path"}));
    var ol = el("ol", {className:"path"});
    var order={must_do_now:0,selective_now:1,later:2,optional:3};
    M.units.slice().sort(function(x,y){return order[x.status]-order[y.status];}).forEach(function(u,i){
      var li=el("li",{"data-status":u.status,"data-canonical-id":u.unit_id});
      li.appendChild(el("span",{className:"dot",text:String(i+1),"aria-hidden":"true"}));
      li.appendChild(el("div",{},[el("strong",{text:u.title}),document.createTextNode(" "),statusChip(u.status)]));
      li.appendChild(el("div",{className:"path-meta",text:u.estimated_hours+"h · overall "+u.overall_priority_score+" · personal ROI "+u.personal_roadmap_roi+(u.prerequisites.length?" · needs: "+u.prerequisites.map(function(p){return unitById[p]?unitById[p].title:p;}).join(", "):"")}));
      if (u.lesson_id) { var lk=el("p",{}, [el("a",{href:pageHref("lessons.html#"+u.lesson_id), text:"Open lesson →"})]); li.appendChild(lk); }
      if (u.defer_reason) li.appendChild(el("div",{className:"path-meta",text:"Deferred: "+u.defer_reason}));
      ol.appendChild(li);
    });
    path.appendChild(ol);
    main.appendChild(path);
  }

  /* ---------- niche ---------- */
  function renderNiche(main) {
    var P = M.pareto_niche;
    var sec = el("section", {"aria-labelledby":"niche-h"});
    sec.appendChild(el("h2", {id:"niche-h", text:"Pareto-niche candidates"}));
    sec.appendChild(el("p", {className:"lede", text:"Scored by 0.25 existing advantage + 0.20 same-person synergy + 0.20 problem density + 0.15 elbow room + 0.10 defensibility + 0.10 proofability − transition cost. Framework: the LessWrong Pareto-best argument; this is an evidence-backed hypothesis, not a best-in-world claim."}));
    var keys=["existing_advantage","same_person_synergy","problem_density","elbow_room","defensibility","proofability"];
    P.candidates.slice().sort(function(x,y){return y.pareto_niche_score-x.pareto_niche_score;}).forEach(function(c){
      var card=el("div",{className:"card"+(c.decision==="selected"?" detail-panel":""),"data-canonical-id":c.candidate_id});
      card.appendChild(el("h3",{},[document.createTextNode(c.label+" "), chip("score "+c.pareto_niche_score,c.decision==="rejected"?"priority-watch":"priority-P1"), chip(c.decision,"status-"+(c.decision==="selected"?"must_do_now":c.decision==="hedge"?"selective_now":"cut_for_now"))]));
      card.appendChild(el("p",{text:c.thesis}));
      var d=el("details", c.decision==="selected"?{open:true}:{});
      d.appendChild(el("summary",{text:"Score components, skill axes, falsification"}));
      var tbl=el("table",{}); tbl.appendChild(el("caption",{text:"Score components (0–1) and transition cost"}));
      var tb=el("tbody",{});
      keys.forEach(function(k){ tb.appendChild(el("tr",{},[el("td",{text:k.replace(/_/g," ")}), el("td",{text:String(c.score_components[k])})])); });
      tb.appendChild(el("tr",{},[el("td",{text:"− transition cost"}),el("td",{text:String(c.transition_cost_penalty)})]));
      tb.appendChild(el("tr",{},[el("td",{},[el("strong",{text:"total"})]),el("td",{},[el("strong",{text:String(c.pareto_niche_score)})])]));
      tbl.appendChild(tb); d.appendChild(tbl);
      var ax=el("p",{},[el("strong",{text:"Skill axes: "})]); c.skill_axes.forEach(function(x,i){if(i)ax.appendChild(document.createTextNode(" × "));ax.appendChild(chip(x,"lane"));}); d.appendChild(ax);
      d.appendChild(el("p",{},[el("strong",{text:"Same-person problems: "}),document.createTextNode(c.same_person_problem_set.join("; "))]));
      var fl=el("p",{},[el("strong",{text:"Falsification: "})]); var ulf=el("ul",{}); c.falsification_conditions.forEach(function(x){ulf.appendChild(el("li",{text:x}));}); d.appendChild(fl); d.appendChild(ulf);
      card.appendChild(d);
      sec.appendChild(card);
    });
    main.appendChild(sec);
  }

  /* ---------- syllabus (phase>section>lesson) ---------- */
  function renderSyllabus(main) {
    var sec=el("section",{"aria-labelledby":"syl-h"});
    sec.appendChild(el("h2",{id:"syl-h",text:"Syllabus — phases → sections → lessons"}));
    sec.appendChild(el("p",{className:"lede",text:"Each phase accumulates into the one primary proof project (Build → Use → Reflect). Active lessons carry a full hands-on contract; open any lesson for problem, build-it, exercises, and measurements."}));
    M.phases.forEach(function(ph){
      var pcard=el("div",{className:"card","data-canonical-id":ph.phase_id,id:ph.phase_id});
      pcard.appendChild(el("h3",{text:ph.title}));
      pcard.appendChild(el("p",{text:ph.outcome}));
      pcard.appendChild(el("p",{className:"path-meta",text:"Milestone: "+ph.milestone}));
      ph.section_ids.forEach(function(sid){
        var s=M.sections.filter(function(x){return x.section_id===sid;})[0]; if(!s)return;
        var sd=el("details",{}); sd.setAttribute("data-canonical-id",sid);
        var lessons=s.lesson_ids.map(function(lid){return lessonById[lid];}).filter(Boolean);
        sd.appendChild(el("summary",{text:s.title+" — "+lessons.length+" lesson"+(lessons.length!==1?"s":"")}));
        sd.appendChild(el("p",{className:"path-meta",text:"Integration checkpoint: "+s.integration_checkpoint}));
        var ul=el("ul",{});
        lessons.forEach(function(l){
          var li=el("li",{"data-canonical-id":l.lesson_id});
          li.appendChild(el("a",{href:pageHref("lessons.html#"+l.lesson_id), text:l.title}));
          li.appendChild(document.createTextNode(" "));
          li.appendChild(statusChip(l.status));
          li.appendChild(el("span",{className:"path-meta",text:" "+l.estimated_hours+"h"}));
          ul.appendChild(li);
        });
        sd.appendChild(ul); pcard.appendChild(sd);
      });
      sec.appendChild(pcard);
    });
    main.appendChild(sec);
  }

  /* ---------- lessons (full contracts) ---------- */
  // Active lessons in canonical build_sequence (chronological) order, each paired
  // with its build-order step. Any active lesson not in the sequence is appended.
  function orderedActiveLessons() {
    var active=M.lessons.filter(function(l){return ["must_do_now","selective_now"].indexOf(l.status)>=0;});
    var byUnit={}; active.forEach(function(l){ byUnit[l.unit_id]=l; });
    var ordered=[], seen={};
    (M.build_sequence||[]).forEach(function(step){
      if(step.unit_id && byUnit[step.unit_id]){ ordered.push({lesson:byUnit[step.unit_id], step:step}); seen[step.unit_id]=true; }
    });
    active.forEach(function(l){ if(!seen[l.unit_id]) ordered.push({lesson:l, step:null}); });
    return ordered;
  }
  function renderLessons(main) {
    main.appendChild(el("p",{className:"lede",text:"Full lesson contracts in build order. Each is a CS336-style assignment writeup: Problem · Objective · Exact inputs · Architecture/config · Implementation steps · Starter files & interfaces · Tests & measurements · Exercises · Proof · Exit gate · primary resource · official API docs · papers."}));
    main.appendChild(el("p",{className:"path-meta",text:"Operating lens: minimal and hackable first (Karpathy), reference → optimized with parity gates (llm.c / llama2.c), implement-and-explain (CS336), and Build → Use → Reflect (TinyTorch). Lessons follow the canonical build sequence; compute and storage limits come from the roadmap manifest."}));
    if(M.compute_policy){
      var cp=M.compute_policy;
      var local=el("section",{"aria-labelledby":"local-first-contract"});
      local.appendChild(el("h2",{id:"local-first-contract",text:"Local-first execution contract"}));
      local.appendChild(el("p",{className:"lede",text:cp.canonical_environment}));
      if(cp.local_first_plan) local.appendChild(el("pre",{className:"config"},[el("code",{text:cp.local_first_plan})]));
      if(cp.storage_plan){
        var storage=el("details",{});
        storage.appendChild(el("summary",{text:"Storage budget and Runpod volume tiers"}));
        storage.appendChild(el("pre",{className:"config"},[el("code",{text:cp.storage_plan})]));
        local.appendChild(storage);
      }
      var gates=el("dl",{className:"project-facts"});
      [["Expected total spend",cp.expected_total_spend],["Paid-run gate",cp.per_run_gate],["Teacher decision",cp.teacher_selection],["DPO escalation",cp.dpo_gpu]].forEach(function(row){
        if(!row[1]) return;
        gates.appendChild(el("dt",{text:row[0]}));
        gates.appendChild(el("dd",{text:row[1]}));
      });
      local.appendChild(gates);
      if(cp.pricing_sources && cp.pricing_sources.length){
        var refs=el("p",{className:"provenance"},[document.createTextNode("Official cost references: ")]);
        cp.pricing_sources.forEach(function(source,index){
          if(index) refs.appendChild(document.createTextNode(" · "));
          refs.appendChild(a(source.url,source.title));
        });
        local.appendChild(refs);
      }
      main.appendChild(local);
    }
    orderedActiveLessons().forEach(function(entry){ main.appendChild(lessonSection(entry.lesson, entry.step)); });
    var laterWrap=el("section",{"aria-labelledby":"later-l"});
    laterWrap.appendChild(el("h2",{id:"later-l",text:"Deferred lessons"}));
    M.lessons.filter(function(l){return ["must_do_now","selective_now"].indexOf(l.status)<0;}).forEach(function(l){
      var d=el("details",{}); d.setAttribute("id",l.lesson_id); d.setAttribute("data-canonical-id",l.lesson_id);
      d.appendChild(el("summary",{},[document.createTextNode(l.title+" "),statusChip(l.status)]));
      d.appendChild(el("p",{text:l.problem}));
      if (unitById[l.unit_id] && unitById[l.unit_id].defer_reason) d.appendChild(el("p",{className:"path-meta",text:unitById[l.unit_id].defer_reason}));
      laterWrap.appendChild(d);
    });
    main.appendChild(laterWrap);
  }
  function lessonSection(l, step) {
    var sec=el("section",{id:l.lesson_id,"aria-labelledby":l.lesson_id+"-h","data-canonical-id":l.lesson_id});
    sec.appendChild(el("h2",{id:l.lesson_id+"-h"},[document.createTextNode((step?("Step "+step.step+" · "):"")+l.title+" "),statusChip(l.status),el("span",{className:"path-meta",text:" "+l.estimated_hours+"h"})]));
    if(step) sec.appendChild(el("p",{className:"path-meta",text:"Build order step "+step.step+" · "+step.when+" · "+step.track}));
    function dt(t,v){ if(!v) return; sec.appendChild(el("h3",{text:t})); sec.appendChild(el("p",{text:v})); }
    function list(t,items,ordered){ if(!items||!items.length) return; sec.appendChild(el("h3",{text:t})); var u=el(ordered?"ol":"ul",{}); items.forEach(function(x){u.appendChild(el("li",{text:x}));}); sec.appendChild(u); }
    function config(t,text){ if(!text) return; sec.appendChild(el("h3",{text:t})); sec.appendChild(el("pre",{className:"config"},[el("code",{text:text})])); }
    dt("Problem", l.problem); dt("Objective", l.objective); dt("Why it matters", l.why_it_matters);
    sec.appendChild(el("h3",{text:"Concepts"}));
    var cu=el("ul",{}); l.concepts.forEach(function(x){cu.appendChild(el("li",{text:x}));}); sec.appendChild(cu);
    dt("Exact inputs", l.exact_inputs);
    config("Architecture & config", l.architecture_config);
    if(l.training_phases){
      var tphz=l.training_phases;
      sec.appendChild(el("h3",{text:"Training phases — local sanity check, then remote scaling"}));
      if(tphz.summary) sec.appendChild(el("p",{text:tphz.summary}));
      var tpg=el("div",{className:"grid grid-2 training-phases"});
      (tphz.phases||[]).forEach(function(phase,pi){
        var pc=el("div",{className:"phase-card "+(pi===0?"is-sanity":"is-scale")});
        pc.appendChild(el("h4",{text:phase.name}));
        if(phase.steps && phase.steps.length){ var ol=el("ol",{}); phase.steps.forEach(function(s){ol.appendChild(el("li",{text:s}));}); pc.appendChild(ol); }
        if(phase.gate) pc.appendChild(el("p",{},[el("strong",{text:"Gate: "}),document.createTextNode(phase.gate)]));
        tpg.appendChild(pc);
      });
      sec.appendChild(tpg);
    }
    dt("Abstraction level", l.abstraction_level);
    dt("Build it", l.build_it);
    list("Implementation steps", l.implementation_steps, true);
    if(l.execution_ladder && l.execution_ladder.length){
      sec.appendChild(el("h3",{text:"Execution ladder"}));
      sec.appendChild(el("p",{className:"path-meta",text:"Concrete local-to-cloud substeps. Each row states where it runs, what data it uses, the command shape, artifact, and promotion gate."}));
      var ladder=el("table",{});
      ladder.appendChild(el("thead",{},[el("tr",{},["Stage","Environment","Data","Action","Command","Artifact","Promotion gate"].map(function(h){return el("th",{text:h});}))]));
      var lb=el("tbody",{});
      l.execution_ladder.forEach(function(row){
        lb.appendChild(el("tr",{},[
          el("td",{},[el("strong",{text:row.stage})]),
          el("td",{text:row.environment}),
          el("td",{text:row.data}),
          el("td",{text:row.action}),
          el("td",{},[el("code",{text:row.command})]),
          el("td",{text:row.artifact}),
          el("td",{text:row.promotion_gate})
        ]));
      });
      ladder.appendChild(lb);
      sec.appendChild(el("div",{className:"table-wrap"},[ladder]));
    }
    if(l.starter_interfaces && l.starter_interfaces.length){ sec.appendChild(el("h3",{text:"Starter files & interfaces"})); sec.appendChild(el("pre",{className:"config"},[el("code",{text:l.starter_interfaces.join("\n")})])); }
    dt("Use it", l.use_it); dt("Ship it", l.ship_it);
    sec.appendChild(el("h3",{text:"Exercises"}));
    var eu=el("ul",{className:"gate-list-block"});
    l.exercises.forEach(function(e){ eu.appendChild(el("li",{},[chip(e.type,"lane"),document.createTextNode(" "+e.prompt+" "),el("span",{className:"path-meta",text:"✓ "+e.completion_gate})])); });
    sec.appendChild(eu);
    sec.appendChild(el("h3",{text:"Tests & measurements"}));
    var tu=el("ul",{}); l.tests_and_measurements.forEach(function(x){tu.appendChild(el("li",{text:x}));}); sec.appendChild(tu);
    sec.appendChild(el("p",{},[el("strong",{text:"Proof artifact: "}),document.createTextNode(l.proof_artifact)]));
    sec.appendChild(el("p",{},[el("strong",{text:"Exit gate: "}),document.createTextNode((l.exit_gate?l.exit_gate+" — ":"")+l.mastery_gate.join(" → "))]));
    sec.appendChild(el("p",{},[el("strong",{text:"Primary resource: "}),a(l.primary_resource.url,l.primary_resource.name),document.createTextNode(" — "+l.primary_resource.section)]));
    if(l.official_api_docs && l.official_api_docs.length){
      sec.appendChild(el("h3",{text:"Official API docs"}));
      var ou=el("ul",{}); l.official_api_docs.forEach(function(d){ ou.appendChild(el("li",{},[a(d.url,d.title),d.reason?document.createTextNode(" — "+d.reason):document.createTextNode("")])); }); sec.appendChild(ou);
    }
    if(l.reference_implementations && l.reference_implementations.length){
      sec.appendChild(el("h3",{text:"How others built this step"}));
      var ru=el("ul",{}); l.reference_implementations.forEach(function(r){ ru.appendChild(el("li",{},[a(r.url,r.title),document.createTextNode(r.note?" — "+r.note:"")])); }); sec.appendChild(ru);
    }
    sec.appendChild(el("h3",{text:"Further reading"}));
    var fu=el("ul",{}); l.further_reading.forEach(function(f){ fu.appendChild(el("li",{},[a(f.url,f.name),document.createTextNode(" — "+f.section+" ("+f.reason+")")])); }); sec.appendChild(fu);
    if(l.primary_sources && l.primary_sources.length){
      sec.appendChild(el("h3",{text:"Primary papers & official docs"}));
      var pu=el("ul",{});
      l.primary_sources.forEach(function(source){
        pu.appendChild(el("li",{},[a(source.url,source.title),document.createTextNode(" — "+source.reason)]));
      });
      sec.appendChild(pu);
    }
    return sec;
  }

  /* ---------- evidence (dual source) ---------- */
  function renderEvidence(main) {
    var c=M.freshness;
    var head=el("section",{"aria-labelledby":"ev-h"});
    head.appendChild(el("h2",{id:"ev-h",text:"Dual-source signals (hiring + Xiaohongshu, 50/50)"}));
    head.appendChild(el("p",{className:"lede",text:"overall = 0.5·hiring + 0.5·Xiaohongshu. Xiaohongshu is user-authored practitioner attention, never employer demand. "+c.xiaohongshu_posts+" posts / "+c.xiaohongshu_authors+" authors / "+c.xiaohongshu_queries+" queries."}));
    var prioFilter="all";
    var fb=el("div",{className:"filterbar",role:"group","aria-label":"Filter by blended priority"});
    var wrap=el("div",{});
    function draw(){
      wrap.innerHTML="";
      var tbl=el("table",{}); tbl.appendChild(el("caption",{text:"Every signal: hiring, Xiaohongshu, blended scores, both priorities, evidence counts, divergence"}));
      tbl.appendChild(el("thead",{},[el("tr",{},["Signal","Hiring","XHS","Overall","Priority","Hiring posts","XHS posts/authors","Δ","My evidence"].map(function(h){return el("th",{text:h});}))]));
      var tb=el("tbody",{});
      SIG.filter(function(s){return prioFilter==="all"||s.priority===prioFilter;}).sort(function(x,y){return y.overall_priority_score-x.overall_priority_score;}).forEach(function(s){
        var d=el("details",{}); d.appendChild(el("summary",{text:s.skill})); d.appendChild(el("p",{text:s.reasoning}));
        if(s.evidence_notes.length) d.appendChild(el("p",{className:"provenance",text:"My evidence: "+s.evidence_notes.join("; ")}));
        var tr=el("tr",{"data-canonical-id":s.signal_id},[
          el("td",{},[d]), el("td",{text:String(s.market_roi_score)}), el("td",{text:String(s.xiaohongshu_signal_score)}),
          el("td",{text:String(s.overall_priority_score)}), el("td",{},[chip(s.priority,"priority-"+s.priority)]),
          el("td",{text:String(s.supporting_postings)}), el("td",{text:s.supporting_xhs_posts+" / "+s.supporting_xhs_authors}),
          el("td",{text:s.divergence>=25?("⚠ "+s.divergence):String(s.divergence)}),
          el("td",{text:s.evidence_maturity==null?"—":s.evidence_maturity+"/6 ("+(s.recruiter_readability||"?")+")"})]);
        tb.appendChild(tr);
      });
      tbl.appendChild(tb); wrap.appendChild(el("div",{className:"table-wrap"},[tbl]));
    }
    ["all","P0","P1","P2","watch"].forEach(function(p){
      var b=el("button",{text:p==="all"?"All":p,"aria-pressed":String(p===prioFilter)});
      b.addEventListener("click",function(){ prioFilter=p; Array.prototype.forEach.call(fb.children,function(x){x.setAttribute("aria-pressed","false");}); b.setAttribute("aria-pressed","true"); draw(); });
      fb.appendChild(b);
    });
    head.appendChild(fb); draw(); head.appendChild(wrap); main.appendChild(head);

    var div=el("section",{"aria-labelledby":"div-h"});
    div.appendChild(el("h2",{id:"div-h",text:"Source divergence"}));
    var ul=el("ul",{});
    ul.appendChild(el("li",{text:"Community-strong / hiring-moderate: LLM inference (hiring 38.4 → Xiaohongshu 81.3, Δ43) — the niche signal."}));
    ul.appendChild(el("li",{text:"Hiring-strong / community-silent: Python, communication, distributed systems, C++, DSA, system design — XHS silence is a query-scope artifact (the niche collection targeted AI-Infra/inference), not low demand. These stay hiring-strong gates."}));
    ul.appendChild(el("li",{text:"Crowding is genuinely contested in the data (红海/扩招 both high-engagement); the un-contested consensus is engineering > research for non-PhD candidates."}));
    div.appendChild(ul); main.appendChild(div);
  }

  /* ---------- projects ---------- */
  function renderProjects(main) {
    var primary=M.projects.filter(function(p){return p.decision==="active_primary";})[0];
    var sec=el("section",{"aria-labelledby":"project-spec-h"});
    sec.appendChild(el("h2",{id:"project-spec-h",text:"Primary project specification"}));
    sec.appendChild(el("p",{className:"lede",text:"A CS336-style assignment contract with frozen model, data, training, serving, experiment, and acceptance decisions."}));

    if(primary){
      var card=el("article",{className:"card detail-panel","data-canonical-id":primary.project_id});
      card.appendChild(el("h3",{text:primary.title}));
      card.appendChild(el("p",{className:"lede",text:primary.positioning_statement}));
      card.appendChild(el("p",{},[el("strong",{text:"Research question: "}),document.createTextNode(primary.research_question)]));
      if(primary.spec_path) card.appendChild(el("p",{},[el("a",{href:docHref(primary.spec_path),text:"Download the full CS336-style specification (Markdown) ↓",download:"elenkhos-project-spec.md"})]));
      if(primary.starter_kit_path) card.appendChild(el("p",{},[el("a",{href:docHref(primary.starter_kit_path),text:"Download the Obsidian-ready starter kit (Markdown) ↓",download:"elenkhos-starter-kit.md"})]));
      if(primary.what_you_will_implement && primary.what_you_will_implement.length){
        card.appendChild(el("h4",{text:"What you will implement"}));
        var impl=el("ol",{});
        primary.what_you_will_implement.forEach(function(x){impl.appendChild(el("li",{text:x}));});
        card.appendChild(impl);
      }
      if(primary.problem_index && primary.problem_index.length){
        card.appendChild(el("h4",{text:"Problem index"}));
        var problems=el("ul",{});
        primary.problem_index.forEach(function(x){problems.appendChild(el("li",{text:x}));});
        card.appendChild(problems);
      }
      if(primary.implementation_references && primary.implementation_references.length){
        card.appendChild(el("h4",{text:"Implementation philosophy references"}));
        var philosophyRefs=el("ul",{});
        primary.implementation_references.forEach(function(item){
          philosophyRefs.appendChild(el("li",{},[
            a(item.url,item.title),
            document.createTextNode(" — "+item.use)
          ]));
        });
        card.appendChild(philosophyRefs);
      }
      if(primary.design_principles && primary.design_principles.length){
        card.appendChild(el("h4",{text:"Design principles & operating constraints"}));
        var dp=el("ul",{}); primary.design_principles.forEach(function(x){dp.appendChild(el("li",{text:x}));}); card.appendChild(dp);
      }
      if(primary.model_strategy){
        card.appendChild(el("h4",{text:"Model strategy — pretrain vs. post-train"}));
        if(primary.model_strategy.summary) card.appendChild(el("p",{className:"lede",text:primary.model_strategy.summary}));
        var mtbl=el("table",{}); mtbl.appendChild(el("thead",{},[el("tr",{},["Model","Training","Why it exists"].map(function(h){return el("th",{text:h});}))]));
        var mtb=el("tbody",{});
        (primary.model_strategy.models||[]).forEach(function(mo){
          mtb.appendChild(el("tr",{},[el("td",{},[el("strong",{text:mo.name})]),el("td",{text:mo.training}),el("td",{text:mo.purpose})]));
        });
        mtbl.appendChild(mtb); card.appendChild(el("div",{className:"table-wrap"},[mtbl]));
        if(primary.model_strategy.baseline_matrix && primary.model_strategy.baseline_matrix.length){
          card.appendChild(el("h4",{text:"70M baseline matrix"}));
          var bt=el("table",{}); bt.appendChild(el("thead",{},[el("tr",{},["Benchmark","Elenkhos-70M-Lab role","Compared serving releases"].map(function(h){return el("th",{text:h});}))]));
          var bb=el("tbody",{});
          primary.model_strategy.baseline_matrix.forEach(function(row){
            bb.appendChild(el("tr",{},[el("td",{text:row.benchmark}),el("td",{text:row.lab_role}),el("td",{text:row.product_comparison})]));
          });
          bt.appendChild(bb); card.appendChild(el("div",{className:"table-wrap"},[bt]));
        }
      }
      if(M.execution_timeline && M.execution_timeline.lab_model_role){
        var lab=M.execution_timeline.lab_model_role;
        card.appendChild(el("h4",{text:"Role of Elenkhos-70M-Lab in the project"}));
        if(lab.summary) card.appendChild(el("p",{text:lab.summary}));
        var labList=el("ul",{});
        (lab.roles||[]).forEach(function(x){labList.appendChild(el("li",{text:x}));});
        card.appendChild(labList);
        if(lab.report_rule) card.appendChild(el("p",{className:"path-meta",text:lab.report_rule}));
      }
      if(M.compute_policy){
        var cp=M.compute_policy;
        card.appendChild(el("h4",{text:"Compute & storage budget"}));
        var cdl=el("dl",{className:"project-facts"});
        function cprow(t,v){ if(!v) return; cdl.appendChild(el("dt",{text:t})); cdl.appendChild(el("dd",{text:v})); }
        cprow("Canonical environment", cp.canonical_environment);
        cprow("Cost ceiling", cp.cost_ceiling_usd?("USD "+cp.cost_ceiling_usd+" hard limit"):null);
        cprow("Expected total spend", cp.expected_total_spend);
        cprow("Per-run gate", cp.per_run_gate);
        cprow("Teacher selection", cp.teacher_selection);
        cprow("DPO GPU", cp.dpo_gpu);
        card.appendChild(cdl);
        if(cp.local_first_plan){ card.appendChild(el("p",{},[el("strong",{text:"Local-first promotion ladder"})])); card.appendChild(el("pre",{className:"config"},[el("code",{text:cp.local_first_plan})])); }
        if(cp.storage_plan){ card.appendChild(el("p",{},[el("strong",{text:"Storage plan"})])); card.appendChild(el("pre",{className:"config"},[el("code",{text:cp.storage_plan})])); }
        if(cp.compute_estimate){ card.appendChild(el("p",{},[el("strong",{text:"Compute estimate"})])); card.appendChild(el("pre",{className:"config"},[el("code",{text:cp.compute_estimate})])); }
        if(cp.pricing_sources && cp.pricing_sources.length){
          card.appendChild(el("p",{},[el("strong",{text:"Official pricing references"})]));
          var ps=el("ul",{});
          cp.pricing_sources.forEach(function(source){ps.appendChild(el("li",{},[a(source.url,source.title)]));});
          card.appendChild(ps);
        }
      }

      var facts=el("dl",{className:"project-facts"});
      function fact(term,value){facts.appendChild(el("dt",{text:term}));facts.appendChild(el("dd",{text:value}));}
      fact("Student architecture",primary.student_architecture||"See canonical roadmap.");
      fact("Dataset",primary.dataset_recipe||"See canonical roadmap.");
      fact("Training",primary.training_recipe||"See canonical roadmap.");
      if(M.compute_policy) fact("Compute boundary",M.compute_policy.canonical_environment);
      card.appendChild(facts);

      if(primary.model_family){
        card.appendChild(el("h4",{text:"Naming contract"}));
        var names=el("div",{className:"chip-row"});
        Object.keys(primary.model_family).forEach(function(key){names.appendChild(chip(primary.model_family[key],key==="runtime"?"src-overall":"lane"));});
        card.appendChild(names);
      }

      card.appendChild(el("h4",{text:"Experiment matrix"}));
      var experiments=el("ul",{});
      (primary.experiment_matrix||[]).forEach(function(x){experiments.appendChild(el("li",{text:x}));});
      card.appendChild(experiments);

      function projectList(title,items){
        if(!items || !items.length) return;
        card.appendChild(el("h4",{text:title}));
        var list=el("ul",{});
        items.forEach(function(x){list.appendChild(el("li",{text:x}));});
        card.appendChild(list);
      }
      projectList("CS336 assignment contract",primary.cs336_contract);
      projectList("Philosophy data sources and gates",primary.philosophy_sources);
      projectList("High-ROI concept coverage",primary.high_roi_coverage);

      if(primary.training_pipeline){
        var tp=primary.training_pipeline;
        card.appendChild(el("h4",{text:"Training pipeline — sanity check, then scale"}));
        if(tp.summary) card.appendChild(el("p",{text:tp.summary}));
        if(tp.data_flow && tp.data_flow.length){
          card.appendChild(el("p",{},[el("strong",{text:"Where & how to get the data"})]));
          var flow=el("ol",{className:"data-flow"});
          tp.data_flow.forEach(function(step){
            var idx=step.indexOf(" — ");
            if(idx>0) flow.appendChild(el("li",{},[el("strong",{text:step.slice(0,idx)}),document.createTextNode(step.slice(idx))]));
            else flow.appendChild(el("li",{text:step}));
          });
          card.appendChild(flow);
        }
        if(tp.phases && tp.phases.length){
          var pgrid=el("div",{className:"grid grid-2 training-phases"});
          tp.phases.forEach(function(phase,pi){
            var pc=el("div",{className:"phase-card "+(pi===0?"is-sanity":"is-scale")});
            pc.appendChild(el("h5",{text:phase.name}));
            var pdl=el("dl",{className:"project-facts"});
            [["Where",phase.where],["Data",phase.data],["Runs",phase.runs],["Proves",phase.proves],["Gate",phase.gate]].forEach(function(pair){
              if(!pair[1]) return;
              pdl.appendChild(el("dt",{text:pair[0]}));
              pdl.appendChild(el("dd",{text:pair[1]}));
            });
            pc.appendChild(pdl);
            pgrid.appendChild(pc);
          });
          card.appendChild(pgrid);
        }
      }

      if(primary.execution_pipelines && primary.execution_pipelines.length){
        card.appendChild(el("h4",{text:"Exact execution pipelines"}));
        card.appendChild(el("p",{text:"Each stage states whether weights change, what data is used, where artifacts live, how compute is selected, and the go/no-go rule."}));
        primary.execution_pipelines.forEach(function(pipeline){
          var details=el("details",{className:"pipeline-panel"});
          details.appendChild(el("summary",{text:pipeline.title}));
          var dl=el("dl",{className:"project-facts"});
          [
            ["Training decision",pipeline.train_or_not],
            ["Exact data",pipeline.data],
            ["Storage",pipeline.storage],
            ["Compute",pipeline.compute],
            ["Abstraction boundary",pipeline.abstraction],
            ["Selection / stop rule",pipeline.selection_rule],
            ["Required artifacts",pipeline.artifacts]
          ].forEach(function(pair){
            dl.appendChild(el("dt",{text:pair[0]}));
            dl.appendChild(el("dd",{text:pair[1]}));
          });
          details.appendChild(dl);
          card.appendChild(details);
        });
      }

      if(primary.portfolio_packaging){
        card.appendChild(el("h4",{text:"Portfolio & resume packaging"}));
        var packaging=el("dl",{className:"project-facts"});
        [
          ["Project-count rule",primary.portfolio_packaging.project_count_rule],
          ["AI / MLE / AI-software resume",primary.portfolio_packaging.ai_resume],
          ["General SWE / backend resume",primary.portfolio_packaging.swe_resume],
          ["Interview rule",primary.portfolio_packaging.interview_rule],
          ["Maximum project entries",String(primary.portfolio_packaging.max_project_entries)]
        ].forEach(function(pair){
          packaging.appendChild(el("dt",{text:pair[0]}));
          packaging.appendChild(el("dd",{text:pair[1]}));
        });
        card.appendChild(packaging);
      }

      if(primary.starter_scaffolds && primary.starter_scaffolds.length){
        card.appendChild(el("h4",{text:"Suggested project files and starter code"}));
        card.appendChild(el("p",{text:"These are interfaces and repository boundaries, not completed CS336 solutions. Implement the TODOs and preserve the listed tests and artifacts."}));
        primary.starter_scaffolds.forEach(function(item){
          var details=el("details",{className:"code-panel"});
          details.appendChild(el("summary",{text:item.title}));
          details.appendChild(el("pre",{},[el("code",{className:"language-"+item.language,text:item.code})]));
          card.appendChild(details);
        });
      }

      if(primary.primary_source_readings && primary.primary_source_readings.length){
        card.appendChild(el("h4",{text:"Primary-source further reading"}));
        var readings=el("ul",{});
        primary.primary_source_readings.forEach(function(item){
          readings.appendChild(el("li",{},[
            el("strong",{text:item.category+": "}),
            a(item.url,item.title)
          ]));
        });
        card.appendChild(readings);
      }

      card.appendChild(el("h4",{text:"Starter repositories"}));
      var repos=el("ul",{});
      (primary.starter_repositories||[]).forEach(function(x){repos.appendChild(el("li",{},[a("https://github.com/"+x,x)]));});
      card.appendChild(repos);

      card.appendChild(el("h4",{text:"Acceptance gates"}));
      var gates=el("ol",{});
      primary.acceptance_criteria.forEach(function(x){gates.appendChild(el("li",{text:x}));});
      card.appendChild(gates);
      sec.appendChild(card);
    }
    main.appendChild(sec);

    var decisions=el("section",{"aria-labelledby":"project-decisions-h"});
    decisions.appendChild(el("h2",{id:"project-decisions-h",text:"Deferred and rejected projects"}));
    M.projects.filter(function(p){return p.decision!=="active_primary";}).forEach(function(project){
      var detail=el("details",{"data-canonical-id":project.project_id});
      detail.appendChild(el("summary",{},[document.createTextNode(project.title+" "),chip(project.decision,"status-"+(project.decision==="later"?"later":"cut_for_now"))]));
      detail.appendChild(el("p",{text:"Proof gap: "+project.proof_gaps.join("; ")}));
      var ul=el("ul",{}); project.acceptance_criteria.forEach(function(x){ul.appendChild(el("li",{text:x}));}); detail.appendChild(ul);
      decisions.appendChild(detail);
    });
    main.appendChild(decisions);
  }

  /* ---------- resources ---------- */
  function renderResources(main) {
    var sec=el("section",{"aria-labelledby":"res-h"});
    sec.appendChild(el("h2",{id:"res-h",text:"Resource disposition audit ("+M.resource_decisions.length+" of "+M.resource_decisions.length+")"}));
    sec.appendChild(el("p",{className:"lede",text:"Every registry resource gets exactly one disposition. Primary/supplement carry exact sections + units; reference/later/cut consume no active time. Registry scores unchanged."}));
    var groups=[["primary","Primary — the build & systems spine"],["supplement","Supplement — named gaps"],["reference_only","Reference only"],["later","Later (trigger-based)"],["cut_for_now","Cut for now"]];
    groups.forEach(function(g){
      var list=M.resource_decisions.filter(function(d){return d.disposition===g[0];});
      if(!list.length)return;
      sec.appendChild(el("h3",{text:g[1]+" ("+list.length+")"}));
      var tbl=el("table",{}); tbl.appendChild(el("thead",{},[el("tr",{},["Resource","Score","Exact sections","Units / trigger","Reason"].map(function(h){return el("th",{text:h});}))]));
      var tb=el("tbody",{});
      list.sort(function(x,y){return y.resource_score-x.resource_score;}).forEach(function(d){
        var tgt=d.assigned_unit_ids.length?d.assigned_unit_ids.map(function(u){return u.replace("unit-","");}).join(", "):(d.trigger?("trigger: "+d.trigger):"—");
        var resourceCell=d.url?a(d.url,d.resource_name):el("span",{text:d.resource_name});
        tb.appendChild(el("tr",{"data-canonical-id":d.resource_id},[el("td",{},[resourceCell]),el("td",{text:String(d.resource_score)}),el("td",{},[sectionLinks(d.assigned_sections)]),el("td",{text:tgt}),el("td",{text:d.reason})]));
      });
      tbl.appendChild(tb); sec.appendChild(el("div",{className:"table-wrap"},[tbl]));
    });
    main.appendChild(sec);
  }

  /* ---------- roadmap (dependency + capstone) ---------- */
  function renderRoadmap(main) {
    if(M.build_sequence && M.build_sequence.length){
      var bseq=el("section",{"aria-labelledby":"seq-h"});
      bseq.appendChild(el("h2",{id:"seq-h",text:"Chronological build order — what to do first, then next"}));
      bseq.appendChild(el("p",{className:"lede",text:"The committed 12-week sequence is one end-to-end capstone. Package A produces the model lineage; Package B exports, serves, schedules, qualifies, and reports it. The eval harness is built early because it gates every later release."}));
      var stbl=el("table",{}); stbl.appendChild(el("caption",{text:"Recommended order across the ~204 committed hours (Jun 22 – Sep 11)"}));
      stbl.appendChild(el("thead",{},[el("tr",{},["#","When","Track","Step","What it produces"].map(function(h){return el("th",{text:h});}))]));
      var stb=el("tbody",{});
      M.build_sequence.forEach(function(s){
        var titleCell=s.unit_id?el("td",{},[el("a",{href:pageHref("lessons.html#"+(unitById[s.unit_id]?unitById[s.unit_id].lesson_id:s.unit_id)),text:s.title})]):el("td",{text:s.title});
        stb.appendChild(el("tr",{},[el("td",{text:String(s.step)}),el("td",{text:s.when}),el("td",{},[chip(s.track,"lane")]),titleCell,el("td",{text:s.produces})]));
      });
      stbl.appendChild(stb); bseq.appendChild(el("div",{className:"table-wrap"},[stbl])); main.appendChild(bseq);
    }
    if(M.execution_timeline){
      var timeline=M.execution_timeline;
      var tsec=el("section",{"aria-labelledby":"timeline-h"});
      tsec.appendChild(el("h2",{id:"timeline-h",text:timeline.title||"12-week execution timeline"}));
      if(timeline.capacity_rule) tsec.appendChild(el("p",{className:"lede",text:timeline.capacity_rule}));
      if(timeline.parallelization_rules && timeline.parallelization_rules.length){
        tsec.appendChild(el("h3",{text:"Parallelization rules"}));
        var pr=el("ul",{});
        timeline.parallelization_rules.forEach(function(rule){pr.appendChild(el("li",{text:rule}));});
        tsec.appendChild(pr);
      }
      if(timeline.lab_model_role){
        tsec.appendChild(el("h3",{text:"Why the 70M lab model exists"}));
        if(timeline.lab_model_role.summary) tsec.appendChild(el("p",{text:timeline.lab_model_role.summary}));
        var lr=el("ul",{});
        (timeline.lab_model_role.roles||[]).forEach(function(role){lr.appendChild(el("li",{text:role}));});
        tsec.appendChild(lr);
        if(timeline.lab_model_role.report_rule) tsec.appendChild(el("p",{className:"path-meta",text:timeline.lab_model_role.report_rule}));
      }
      var tt=el("table",{});
      tt.appendChild(el("caption",{text:"Weekly lanes: training/lab model, product model, serving/reporting, and parallel work"}));
      tt.appendChild(el("thead",{},[el("tr",{},["Week","Dates","Focus","Training / lab lane","Product model lane","Serving / report lane","Parallel notes","Gate"].map(function(h){return el("th",{text:h});}))]));
      var tb=el("tbody",{});
      (timeline.weeks||[]).forEach(function(w){
        tb.appendChild(el("tr",{},[
          el("td",{text:"W"+w.week+" · "+w.committed_hours+"h + "+w.reserve_hours+"h reserve"}),
          el("td",{text:w.dates}),
          el("td",{text:w.primary_focus}),
          el("td",{text:w.train_lane}),
          el("td",{text:w.product_lane}),
          el("td",{text:w.serving_lane}),
          el("td",{text:w.parallel_notes}),
          el("td",{text:w.gate})
        ]));
      });
      tt.appendChild(tb);
      tsec.appendChild(el("div",{className:"table-wrap"},[tt]));
      main.appendChild(tsec);
    }
    var sec=el("section",{"aria-labelledby":"dep-h"});
    sec.appendChild(el("h2",{id:"dep-h",text:"Dependency board"}));
    sec.appendChild(el("p",{className:"lede",text:"Select a unit to highlight its prerequisite chain and open its lesson. Columns are status."}));
    var board=el("div",{className:"dep-board"});
    var detail=el("div",{className:"card detail-panel",role:"region","aria-live":"polite","aria-label":"Selected unit"});
    detail.appendChild(el("p",{text:"Select a unit to see scores, resource, and lesson link."}));
    var selected=null;
    var STATUS_ORDER=["must_do_now","selective_now","later","optional"];
    function chain(uid,acc){ acc=acc||{}; (unitById[uid].prerequisites||[]).forEach(function(p){acc[p]=true;chain(p,acc);}); return acc; }
    function show(u){
      detail.innerHTML=""; detail.setAttribute("data-canonical-id",u.unit_id);
      detail.appendChild(el("h3",{},[document.createTextNode(u.title+" "),statusChip(u.status)]));
      detail.appendChild(scoreRow(u));
      var dl=el("dl",{});
      function row(t,v){dl.appendChild(el("dt",{text:t}));dl.appendChild(el("dd",{text:v}));}
      row("Personal ROI", String(u.personal_roadmap_roi)+" · maturity "+u.evidence_maturity+"/6 · "+u.estimated_hours+"h");
      row("Signals", u.signal_ids.map(sigName).join(", "));
      row("Prerequisites", u.prerequisites.length?u.prerequisites.map(function(p){return unitById[p].title;}).join(", "):"none");
      row("Mastery gate", u.mastery_gate.join(" → "));
      if(u.defer_reason) row("Deferred", u.defer_reason);
      detail.appendChild(dl);
      if(u.lesson_id) detail.appendChild(el("p",{},[el("a",{href:pageHref("lessons.html#"+u.lesson_id),text:"Open full lesson →"})]));
    }
    function draw(){
      board.innerHTML=""; var ch=selected?chain(selected):{};
      STATUS_ORDER.forEach(function(st){
        var col=el("div",{className:"dep-col"}); col.appendChild(el("h3",{text:STATUS[st]}));
        M.units.filter(function(u){return u.status===st;}).forEach(function(u){
          var b=el("button",{className:"unit-node","data-canonical-id":u.unit_id,"aria-pressed":String(selected===u.unit_id)});
          if(selected&&ch[u.unit_id])b.className+=" is-prereq"; if(selected&&selected!==u.unit_id&&!ch[u.unit_id])b.className+=" dimmed";
          b.appendChild(el("strong",{text:u.title})); b.appendChild(el("br",{}));
          b.appendChild(el("span",{className:"hours",text:u.estimated_hours+"h · overall "+u.overall_priority_score+(u.prerequisites.length?" · needs "+u.prerequisites.map(function(p){return unitById[p].title;}).join(", "):"")}));
          b.addEventListener("click",function(){ selected=(selected===u.unit_id)?null:u.unit_id; draw(); if(selected)show(u); });
          col.appendChild(b);
        });
        board.appendChild(col);
      });
    }
    draw(); sec.appendChild(board); sec.appendChild(detail); main.appendChild(sec);

    // capstone accumulation
    var cap=el("section",{"aria-labelledby":"cap-h"});
    cap.appendChild(el("h2",{id:"cap-h",text:"Primary proof project & milestones"}));
    var primary=M.projects.filter(function(p){return p.decision==="active_primary";})[0];
    if(primary){
      var card=el("div",{className:"card","data-canonical-id":primary.project_id});
      card.appendChild(el("h3",{text:primary.title}));
      if(primary.positioning_statement) card.appendChild(el("p",{className:"lede",text:primary.positioning_statement}));
      if(primary.research_question) card.appendChild(el("p",{},[el("strong",{text:"Research question: "}),document.createTextNode(primary.research_question)]));
      if(primary.user_advantage && primary.user_advantage.length){
        card.appendChild(el("h4",{text:"Why this is specifically yours"}));
        var ua=el("ul",{}); primary.user_advantage.forEach(function(x){ua.appendChild(el("li",{text:x}));}); card.appendChild(ua);
      }
      if(primary.owned_vs_delegated){
        card.appendChild(el("h4",{text:"Architecture boundary"}));
        card.appendChild(el("p",{},[el("strong",{text:"Own: "}),document.createTextNode((primary.owned_vs_delegated.owned||[]).join("; "))]));
        card.appendChild(el("p",{},[el("strong",{text:"Delegate: "}),document.createTextNode((primary.owned_vs_delegated.delegated||[]).join("; "))]));
      }
      var activeHours=M.units.filter(function(u){return u.status==="must_do_now" || u.status==="selective_now";})
        .reduce(function(sum,u){return sum+u.estimated_hours;},0);
      card.appendChild(el("p",{text:"Proves: "+primary.signal_ids.map(sigName).join(", ")+" · "+activeHours+"h build units + "+primary.estimated_hours+"h integration = "+(activeHours+primary.estimated_hours)+"h committed"}));
      var ul=el("ul",{}); primary.acceptance_criteria.forEach(function(x){ul.appendChild(el("li",{text:x}));}); card.appendChild(ul);
      cap.appendChild(card);
    }
    var ms=el("div",{className:"table-wrap"}); var tbl=el("table",{});
    tbl.appendChild(el("caption",{text:"Phase milestones (Build → Use → Reflect accumulation)"}));
    tbl.appendChild(el("thead",{},[el("tr",{},[el("th",{text:"Phase"}),el("th",{text:"Outcome"}),el("th",{text:"Milestone"})])]));
    var tb=el("tbody",{});
    M.phases.forEach(function(p){ tb.appendChild(el("tr",{"data-canonical-id":p.phase_id},[el("td",{text:p.title}),el("td",{text:p.outcome}),el("td",{text:p.milestone})])); });
    tbl.appendChild(tb); ms.appendChild(tbl); cap.appendChild(ms); main.appendChild(cap);

    // accessible dependency table
    var tsec=el("section",{"aria-labelledby":"ut-h"});
    tsec.appendChild(el("h2",{id:"ut-h",text:"All units (accessible equivalent)"}));
    var t2=el("table",{}); t2.appendChild(el("thead",{},[el("tr",{},["Unit","Status","Prereqs","Hours","Hiring","XHS","Overall","Personal ROI"].map(function(h){return el("th",{text:h});}))]));
    var b2=el("tbody",{});
    M.units.forEach(function(u){ b2.appendChild(el("tr",{"data-canonical-id":u.unit_id},[
      el("td",{text:u.title}),el("td",{},[statusChip(u.status)]),el("td",{text:u.prerequisites.map(function(p){return unitById[p].title;}).join(", ")||"none"}),
      el("td",{text:String(u.estimated_hours)}),el("td",{text:String(u.market_roi_score)}),el("td",{text:String(u.xiaohongshu_signal_score)}),
      el("td",{text:String(u.overall_priority_score)}),el("td",{text:String(u.personal_roadmap_roi)})])); });
    t2.appendChild(b2); tsec.appendChild(el("div",{className:"table-wrap"},[t2])); main.appendChild(tsec);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var main=document.querySelector("main"), page=document.body.getAttribute("data-page");
    ({overview:renderOverview, niche:renderNiche, syllabus:renderSyllabus, lessons:renderLessons,
      projects:renderProjects, evidence:renderEvidence, resources:renderResources, roadmap:renderRoadmap}[page]||function(){})(main);
    var foot=document.querySelector(".site-footer .inner"); if(foot) provenance(foot);
  });
})();
