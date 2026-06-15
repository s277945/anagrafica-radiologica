package com.anagrafica.radiologica.repository;

import com.anagrafica.radiologica.entity.ClosureId;
import com.anagrafica.radiologica.entity.ContenitoreClosure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContenitoreClosureRepository extends JpaRepository<ContenitoreClosure, ClosureId> {

    @Query("SELECT cl FROM ContenitoreClosure cl WHERE cl.ancestorId = :ancestorId ORDER BY cl.depth")
    List<ContenitoreClosure> findByAncestorId(@Param("ancestorId") Long ancestorId);

    @Modifying
    @Query(value = """
        INSERT INTO contenitori_closure (ancestor_id, descendant_id, depth)
        SELECT ancestor_id, :childId, depth + 1
        FROM contenitori_closure
        WHERE descendant_id = :parentId
        """, nativeQuery = true)
    void insertClosuresForNewChild(@Param("childId") Long childId, @Param("parentId") Long parentId);
}
